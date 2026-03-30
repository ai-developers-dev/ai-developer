import { createServerFn } from '@tanstack/react-start'
import * as chrono from 'chrono-node'

const CAL_API_BASE = 'https://api.cal.com/v2'

function getCalHeaders(apiVersion: string) {
  const key = process.env.CAL_API_KEY
  if (!key) throw new Error('CAL_API_KEY not configured')
  return {
    Authorization: `Bearer ${key}`,
    'cal-api-version': apiVersion,
    'Content-Type': 'application/json',
  }
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export const getAvailableSlots = createServerFn({ method: 'POST' })
  .inputValidator((data: { dateExpression: string; timeZone?: string }) => data)
  .handler(async ({ data }) => {
    const eventTypeId = process.env.CAL_EVENT_TYPE_ID
    if (!eventTypeId) throw new Error('CAL_EVENT_TYPE_ID not configured')

    const tz = data.timeZone || 'America/Chicago'

    // Parse natural language date
    const parsed = chrono.parseDate(data.dateExpression, new Date(), { forwardDate: true })
    if (!parsed) {
      return { success: false, error: 'Could not understand the date. Try something like "tomorrow" or "next Tuesday".', slots: [] }
    }

    const startDate = parsed.toISOString().split('T')[0]
    // Get slots for that day only
    const nextDay = new Date(parsed)
    nextDay.setDate(nextDay.getDate() + 1)
    const endDate = nextDay.toISOString().split('T')[0]

    const url = `${CAL_API_BASE}/slots?eventTypeId=${eventTypeId}&start=${startDate}&end=${endDate}&timeZone=${encodeURIComponent(tz)}`

    const res = await fetch(url, {
      headers: getCalHeaders('2024-09-04'),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Cal.com slots error:', res.status, text)
      return { success: false, error: 'Failed to check availability.', slots: [] }
    }

    const json = await res.json() as { data: Record<string, { start: string }[]> }
    const allSlots: { time: string; display: string; dateDisplay: string }[] = []

    for (const [, daySlots] of Object.entries(json.data)) {
      for (const slot of daySlots) {
        allSlots.push({
          time: slot.start,
          display: formatTime(slot.start),
          dateDisplay: formatDate(slot.start),
        })
      }
    }

    // Return up to 6 slots spread across the day (morning, midday, afternoon)
    let selected = allSlots
    if (allSlots.length > 6) {
      const step = Math.floor(allSlots.length / 6)
      selected = [0, 1, 2, 3, 4, 5].map(i => allSlots[Math.min(i * step, allSlots.length - 1)])
    }

    const dateLabel = selected.length > 0 ? selected[0].dateDisplay : formatDate(parsed.toISOString())

    return {
      success: true,
      date: dateLabel,
      slots: selected,
    }
  })

export const bookCalSlot = createServerFn({ method: 'POST' })
  .inputValidator((data: { start: string; name: string; email: string; timeZone?: string }) => data)
  .handler(async ({ data }) => {
    const eventTypeId = process.env.CAL_EVENT_TYPE_ID
    if (!eventTypeId) throw new Error('CAL_EVENT_TYPE_ID not configured')

    const tz = data.timeZone || 'America/Chicago'

    const res = await fetch(`${CAL_API_BASE}/bookings`, {
      method: 'POST',
      headers: getCalHeaders('2024-08-13'),
      body: JSON.stringify({
        start: data.start,
        eventTypeId: parseInt(eventTypeId, 10),
        attendee: {
          name: data.name,
          email: data.email,
          timeZone: tz,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Cal.com booking error:', res.status, text)
      return { success: false, error: 'Failed to create booking. The slot may no longer be available.' }
    }

    const json = await res.json() as { data: { uid: string; title: string; start: string } }

    return {
      success: true,
      bookingId: json.data.uid,
      title: json.data.title,
      time: formatTime(json.data.start),
      date: formatDate(json.data.start),
    }
  })
