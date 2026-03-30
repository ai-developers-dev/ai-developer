import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleGenAI, type LiveServerMessage, Modality } from '@google/genai'
import { getGeminiKey, submitBooking } from '@/lib/gemini-server.js'

export type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'speaking'

const SYSTEM_INSTRUCTION = `You are the AI assistant for AI Developer, an AI-powered development agency.

Services offered:
- Custom Websites (modern, responsive, SEO-optimized)
- Web Applications (full-stack React/Next.js apps)
- Voice AI Agents (phone agents that answer calls, book appointments, qualify leads 24/7)
- Chat AI Agents (website chatbots, customer support bots)
- AI Assistants (custom GPTs, internal tools)
- AI Automations (workflow automation, data processing)

Key selling points:
- 3x faster delivery using AI throughout the development process
- 50% lower cost compared to traditional agencies
- 24/7 AI-powered solutions

If the visitor wants to book a discovery call, collect:
1. Their name
2. Their email address
3. Their preferred day/time for the call

Once you have all three, confirm the details back and let them know someone will reach out to confirm. Then call the submit_booking function with the collected information.

Be friendly, concise, and conversational. Keep responses short (1-2 sentences) since this is voice.`

const BOOKING_TOOL = {
  functionDeclarations: [
    {
      name: 'submit_booking',
      description: 'Submit a discovery call booking request',
      parameters: {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const, description: 'Visitor name' },
          email: { type: 'string' as const, description: 'Visitor email' },
          preferred_time: {
            type: 'string' as const,
            description: 'Preferred day/time',
          },
        },
        required: ['name', 'email', 'preferred_time'],
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
        scheduledTimeRef.current = ctx.currentTime + 0.08 // 80ms initial buffer
      }

      scheduleBuffers()
    },
    [scheduleBuffers],
  )

  const start = useCallback(async () => {
    if (activeRef.current) return
    activeRef.current = true
    setStatus('connecting')

    try {
      // 1. Get API key from server
      const { key } = await getGeminiKey()

      // 2. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      micStreamRef.current = stream

      // 3. Create audio contexts
      captureCtxRef.current = new AudioContext({ sampleRate: 16000 })
      playbackCtxRef.current = new AudioContext({ sampleRate: 24000 })

      // 4. Set up AudioWorklet for mic capture
      await captureCtxRef.current.audioWorklet.addModule('/audio-processor.js')
      const source = captureCtxRef.current.createMediaStreamSource(stream)
      const workletNode = new AudioWorkletNode(
        captureCtxRef.current,
        'audio-processor',
      )
      workletNodeRef.current = workletNode
      source.connect(workletNode)

      // 5. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: key })
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          tools: [BOOKING_TOOL],
        },
        callbacks: {
          onopen: () => {
            if (activeRef.current) setStatus('listening')
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

            // Handle function calls (booking)
            const toolCall = msg.toolCall
            if (toolCall?.functionCalls) {
              for (const fc of toolCall.functionCalls) {
                if (fc.name === 'submit_booking' && fc.args) {
                  const args = fc.args as {
                    name?: string
                    email?: string
                    preferred_time?: string
                  }
                  try {
                    await submitBooking({
                      data: {
                        name: args.name ?? '',
                        email: args.email ?? '',
                        preferredTime: args.preferred_time ?? '',
                      },
                    })
                    // Send function response back to session
                    if (!activeRef.current || !sessionRef.current) return
                    const sess = sessionRef.current as {
                      sendToolResponse?: (r: unknown) => void
                    }
                    if (sess?.sendToolResponse) {
                      try {
                        sess.sendToolResponse({
                          functionResponses: [
                            {
                              id: fc.id,
                              name: fc.name,
                              response: { success: true },
                            },
                          ],
                        })
                      } catch { /* session closed */ }
                    }
                  } catch {
                    console.error('Booking submission failed')
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

      // 6. Send mic audio to session
      workletNode.port.onmessage = (event: MessageEvent) => {
        if (!activeRef.current || !sessionRef.current) return
        const pcmBuffer = event.data as ArrayBuffer
        const int16 = new Int16Array(pcmBuffer)
        const uint8 = new Uint8Array(int16.buffer)

        // Convert to base64
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
