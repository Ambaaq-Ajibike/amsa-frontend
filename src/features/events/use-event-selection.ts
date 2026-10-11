import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { eventService } from '@/gateway/services'
import type { Event } from '@/gateway/types/api'

export function useEventSelection() {
  const [eventId, setEventId] = useState('')
  const query = useQuery({
    queryKey: ['admin-event-selection'],
    queryFn: () => eventService.getAllEvents(),
    staleTime: 60_000,
  })
  const events = query.data ?? []

  useEffect(() => {
    if (!events.length) return
    if (eventId && events.some((event) => event.id === eventId)) return
    const upcoming = events
      .filter((event) => event.status.toLowerCase() === 'upcoming')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    setEventId((upcoming[0] ?? events[0]).id)
  }, [events, eventId])

  return {
    events,
    eventId,
    setEventId,
    selectedEvent: events.find((event: Event) => event.id === eventId),
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
