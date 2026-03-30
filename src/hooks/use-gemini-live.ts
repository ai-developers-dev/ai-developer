import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleGenAI, type LiveServerMessage, Modality } from '@google/genai'
import { getGeminiKey } from '@/lib/gemini-server.js'
import { getAvailableSlots, bookCalSlot } from '@/lib/cal-server.js'

export type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'speaking'

const SYSTEM_INSTRUCTION = `You are the AI voice assistant for AI Developer, an AI-powered development agency. Your name is "AI Developer Assistant."

Services offered:
- Custom Websites (modern, responsive, SEO-optimized)
- Web Applications (full-stack React/Next.js apps)
- Voice AI Agents (phone agents that answer calls, book appointments, qualify leads 24/7)
- Chat AI Agents (website chatbots, customer support bots)
- AI Assistants (custom GPTs, internal tools)
- AI Automations (workflow automation, data processing)

Key selling points:
- 20x faster delivery using AI throughout the development process
- Up to 90% lower cost compared to traditional agencies
- 24/7 AI-powered solutions

BOOKING A DISCOVERY CALL:
When a visitor wants to book a discovery call, follow these steps IN ORDER:
1. Ask "What day works best for you?" — accept natural language like "tomorrow", "next Tuesday", "April 5th"
2. Call the check_availability function with their answer to get real available time slots
3. Read back 3-4 available times from the results. Example: "On Tuesday I have 9 AM, 11 AM, 2 PM, and 4 PM available. Which works best?"
4. Once they pick a time, ask for their name and email
5. Call the book_appointment function with the selected slot time, their name, and email
6. Confirm the booking: "You're all set! You're booked for [day] at [time]. You'll get a confirmation email shortly. Have a great day!"

IMPORTANT: Always use check_availability BEFORE offering times — never make up availability. If no slots are available, suggest the next day.

Be friendly, concise, and conversational. Keep responses short (1-2 sentences) since this is voice.`

const CAL_TOOLS = {
  functionDeclarations: [
    {
      name: 'check_availability',
      description: 'Check available appointment slots for a discovery call on a given day. Call this when the user says what day they want to book.',
      parameters: {
        type: 'object' as const,
        properties: {
          date_expression: {
            type: 'string' as const,
            description: 'The day to check availability for, e.g. "tomorrow", "next Tuesday", "April 5th", "this Friday"',
          },
        },
        required: ['date_expression'],
      },
    },
    {
      name: 'book_appointment',
      description: 'Book a confirmed discovery call appointment. Call this after the user has selected a time slot and provided their name and email.',
      parameters: {
        type: 'object' as const,
        properties: {
          slot_time: {
            type: 'string' as const,
            description: 'The ISO datetime string of the selected time slot (from check_availability results)',
          },
          name: { type: 'string' as const, description: 'The attendee full name' },
          email: { type: 'string' as const, description: 'The attendee email address' },
        },
        required: ['slot_time', 'name', 'email'],
      },
    },
  ],
}

export function useGeminiLive() {
  const [status, setStatus] = useState<VoiceStatus>('idle')

  const sessionRef = useRef<ReturnType<
    ReturnType<GoogleGenAI['live']>['connect']
  > | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const captureCtxRef = useRef<AudioContext | null>(null)
  const playbackCtxRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const activeRef = useRef(false)
  const cleaningUpRef = useRef(false)
  const greetingDoneRef = useRef(false)
  const startMicCaptureRef = useRef<(() => void) | null>(null)

  // Audio scheduling refs for gapless playback
  const scheduledTimeRef = useRef(0)
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([])
  const scheduleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioQueueRef = useRef<Float32Array[]>([])

  const stopPlayback = useCallback(() => {
    // Clear the scheduling timer
    if (scheduleTimerRef.current) {
      clearTimeout(scheduleTimerRef.current)
      scheduleTimerRef.current = null
    }
    // Clear queued audio
    audioQueueRef.current = []
    // Stop all playing sources
    activeSourcesRef.current.forEach((s) => {
      try { s.stop() } catch { /* already stopped */ }
    })
    activeSourcesRef.current = []
    scheduledTimeRef.current = 0
  }, [])

  const cleanup = useCallback(() => {
    if (cleaningUpRef.current) return
    cleaningUpRef.current = true
    activeRef.current = false

    // 0. Stop greeting audio
    if (greetingAudioRef.current) {
      greetingAudioRef.current.pause()
      greetingAudioRef.current = null
    }

    // 1. Stop audio playback
    stopPlayback()

    // 2. Stop the worklet port so no more audio messages arrive
    if (workletNodeRef.current) {
      workletNodeRef.current.port.onmessage = null
      workletNodeRef.current.disconnect()
      workletNodeRef.current = null
    }

    // 3. Null out session ref before closing
    const sess = sessionRef.current
    sessionRef.current = null
    if (sess) {
      try {
        const s = sess as { close?: () => void }
        if (typeof s.close === 'function') s.close()
      } catch { /* already closed */ }
    }

    // 4. Stop mic and close audio contexts
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null

    void captureCtxRef.current?.close().catch(() => {})
    captureCtxRef.current = null

    void playbackCtxRef.current?.close().catch(() => {})
    playbackCtxRef.current = null

    cleaningUpRef.current = false
    setStatus('idle')
  }, [stopPlayback])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Schedule queued audio buffers for gapless playback
  const scheduleBuffers = useCallback(() => {
    const ctx = playbackCtxRef.current
    if (!ctx || audioQueueRef.current.length === 0) return

    const SCHEDULE_AHEAD = 0.2 // Schedule 200ms ahead of current time

    while (
      audioQueueRef.current.length > 0 &&
      scheduledTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD
    ) {
      const audioData = audioQueueRef.current.shift()!
      const buffer = ctx.createBuffer(1, audioData.length, 24000)
      buffer.getChannelData(0).set(audioData)

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)

      // Schedule right after previous chunk ends (gapless)
      const startTime = Math.max(scheduledTimeRef.current, ctx.currentTime)
      source.start(startTime)
      scheduledTimeRef.current = startTime + buffer.duration

      activeSourcesRef.current.push(source)
      source.onended = () => {
        const idx = activeSourcesRef.current.indexOf(source)
        if (idx !== -1) activeSourcesRef.current.splice(idx, 1)
      }
    }

    // If more chunks are queued, schedule them soon
    if (audioQueueRef.current.length > 0) {
      scheduleTimerRef.current = setTimeout(() => scheduleBuffers(), 50)
    }
  }, [])

  // Decode base64 PCM and queue for scheduled playback
  const playAudio = useCallback(
    (pcmBase64: string) => {
      const ctx = playbackCtxRef.current
      if (!ctx) return

      // Decode base64 → Uint8 → Int16 → Float32
      const raw = atob(pcmBase64)
      const bytes = new Uint8Array(raw.length)
      for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i)
      }

      const int16 = new Int16Array(bytes.buffer)
      const float32 = new Float32Array(int16.length)
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768
      }

      // Queue the chunk and schedule playback
      audioQueueRef.current.push(float32)

      // If this is the first chunk (nothing scheduled yet or scheduled time is in the past),
      // add a small initial buffer delay so we have a few chunks ready before playing
      if (scheduledTimeRef.current <= ctx.currentTime) {
        scheduledTimeRef.current = ctx.currentTime + 0.03 // 30ms initial buffer — faster first response
      }

      scheduleBuffers()
    },
    [scheduleBuffers],
  )

  const greetingAudioRef = useRef<HTMLAudioElement | null>(null)

  const start = useCallback(async () => {
    if (activeRef.current) return
    activeRef.current = true
    greetingDoneRef.current = false

    // Play recorded Gemini greeting INSTANTLY — same voice, zero wait
    setStatus('speaking')
    try {
      const audio = new Audio('/greeting.mp3')
      greetingAudioRef.current = audio
      await audio.play()
    } catch { /* autoplay blocked — continue silently */ }

    try {
      // Connect to Gemini in background while greeting plays
      const [{ key }, stream] = await Promise.all([
        getGeminiKey(),
        navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        }),
      ])
      micStreamRef.current = stream

      // 2. Create audio contexts + worklet
      captureCtxRef.current = new AudioContext({ sampleRate: 16000 })
      playbackCtxRef.current = new AudioContext({ sampleRate: 24000 })
      await captureCtxRef.current.audioWorklet.addModule('/audio-processor.js')
      const source = captureCtxRef.current.createMediaStreamSource(stream)
      const workletNode = new AudioWorkletNode(
        captureCtxRef.current,
        'audio-processor',
      )
      workletNodeRef.current = workletNode
      source.connect(workletNode)

      // 3. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: key })
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          tools: [CAL_TOOLS],
        },
        callbacks: {
          onopen: () => {
            // Stay in 'connecting' — greeting will trigger 'speaking'
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (!activeRef.current) return

            const serverContent = msg.serverContent

            // Handle user interruption (barge-in) — stop playing AI audio
            if (serverContent?.interrupted) {
              stopPlayback()
              setStatus('listening')
              return
            }

            // Handle audio responses
            if (serverContent?.modelTurn?.parts) {
              for (const part of serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  setStatus('speaking')
                  playAudio(part.inlineData.data)
                }
              }
            }

            // Back to listening when model turn is done
            if (serverContent?.turnComplete) {
              setStatus('listening')
            }

            // Handle function calls (Cal.com tools)
            const toolCall = msg.toolCall
            if (toolCall?.functionCalls) {
              for (const fc of toolCall.functionCalls) {
                const sendToolResponse = (response: unknown) => {
                  if (!activeRef.current || !sessionRef.current) return
                  const sess = sessionRef.current as { sendToolResponse?: (r: unknown) => void }
                  if (sess?.sendToolResponse) {
                    try {
                      sess.sendToolResponse({
                        functionResponses: [{ id: fc.id, name: fc.name, response }],
                      })
                    } catch { /* session closed */ }
                  }
                }

                if (fc.name === 'check_availability' && fc.args) {
                  const args = fc.args as { date_expression?: string }
                  try {
                    const result = await getAvailableSlots({
                      data: { dateExpression: args.date_expression ?? 'tomorrow' },
                    })
                    if (result.success && result.slots.length > 0) {
                      const slotList = result.slots.map((s: { display: string; time: string }) => `${s.display} (${s.time})`).join(', ')
                      sendToolResponse({ available: true, date: result.date, slots: slotList, slot_count: result.slots.length })
                    } else {
                      sendToolResponse({ available: false, error: result.error || 'No slots available on that day. Try another day.' })
                    }
                  } catch (err) {
                    console.error('check_availability failed:', err)
                    sendToolResponse({ available: false, error: 'Failed to check availability. Please try again.' })
                  }
                }

                if (fc.name === 'book_appointment' && fc.args) {
                  const args = fc.args as { slot_time?: string; name?: string; email?: string }
                  try {
                    const result = await bookCalSlot({
                      data: {
                        start: args.slot_time ?? '',
                        name: args.name ?? '',
                        email: args.email ?? '',
                      },
                    })
                    if (result.success) {
                      sendToolResponse({ success: true, date: result.date, time: result.time, bookingId: result.bookingId })
                      // Auto-hangup after AI confirms (give it time to speak the confirmation)
                      setTimeout(() => cleanup(), 10000)
                    } else {
                      sendToolResponse({ success: false, error: result.error })
                    }
                  } catch (err) {
                    console.error('book_appointment failed:', err)
                    sendToolResponse({ success: false, error: 'Booking failed. Please try again.' })
                  }
                }
              }
            }
          },
          onerror: (e: Event) => {
            console.error('Gemini Live error:', e)
            cleanup()
          },
          onclose: () => {
            cleanup()
          },
        },
      })

      sessionRef.current = session as typeof sessionRef.current

      // 6. Function to start mic capture — called AFTER greeting finishes
      function startMicCapture() {
        if (!workletNodeRef.current) return
        workletNodeRef.current.port.onmessage = (event: MessageEvent) => {
          if (!activeRef.current || !sessionRef.current) return
          const pcmBuffer = event.data as ArrayBuffer
          const int16 = new Int16Array(pcmBuffer)
          const uint8 = new Uint8Array(int16.buffer)

          let binary = ''
          for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i])
          }
          const base64 = btoa(binary)

          try {
            const sess = sessionRef.current as {
              sendRealtimeInput?: (i: unknown) => void
            }
            if (sess?.sendRealtimeInput) {
              sess.sendRealtimeInput({
                media: { mimeType: 'audio/pcm;rate=16000', data: base64 },
              })
            }
          } catch { /* session closed */ }
        }
      }

      // Expose startMicCapture so onmessage callback can call it
      // Store it on a ref the callback can access
      startMicCaptureRef.current = startMicCapture

      // 7. Gemini connected — tell it the user was already greeted, start mic when greeting audio ends
      greetingDoneRef.current = true
      if (startMicCaptureRef.current) startMicCaptureRef.current()

      // Tell Gemini the greeting already happened so it has context
      try {
        const sess = session as { sendClientContent?: (params: unknown) => void }
        if (sess?.sendClientContent) {
          sess.sendClientContent({
            turns: [
              { role: 'model', parts: [{ text: 'Welcome to AI Developer! How can I help you today?' }] },
            ],
            turnComplete: false,
          })
        }
      } catch { /* ignore */ }

      // Switch to listening when greeting audio finishes
      const audio = greetingAudioRef.current
      if (audio && !audio.ended) {
        audio.onended = () => { if (activeRef.current) setStatus('listening') }
      } else {
        setStatus('listening')
      }
    } catch (err) {
      console.error('Failed to start Gemini Live session:', err)
      cleanup()
    }
  }, [cleanup, playAudio, stopPlayback])

  const stop = useCallback(() => {
    cleanup()
  }, [cleanup])

  return { status, start, stop }
}
