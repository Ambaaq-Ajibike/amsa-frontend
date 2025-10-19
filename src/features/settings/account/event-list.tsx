'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { eventService } from '@/gateway/services'
import { showSuccessToast, showErrorToast } from '@/utils/error-handler'
import { LoaderCircleIcon } from 'lucide-react'
import { IconLoader2 } from '@tabler/icons-react'

interface Event {
  id: string
  title: string
  startDate: string
}

interface EventResponse {
  items: Event[]
  totalItems: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getEvents(status: string = 'upcoming') {
  const res = await eventService.getEvents({
    status: status as 'upcoming' | 'ongoing' | 'completed',
    isAscending: true
  })
  return res.items.map((event) => ({
    id: event.id,
    name: event.title,
    date: new Date(event.startDate),
  }))
}

async function registerEvent(eventId: string) {
  return eventService.registerForEvent(eventId)
}

export function EventList() {
  const queryClient = useQueryClient()
  const [registeringId, setRegisteringId] = useState<string | null>(null)

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => getEvents(),
  })

  const { mutate } = useMutation({
    mutationFn: registerEvent,
    onSuccess: (data: unknown) => {
      const message = (data as { message?: string })?.message || 'Event Registration Successful!'
      showSuccessToast(message)
      setRegisteringId(null)
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] })
    },
    onError: (error: unknown) => {
      showErrorToast(error)
      setRegisteringId(null)
    },
  })

  if (isLoading) {
    return <LoaderCircleIcon className="animate-spin" />
  }

  if (isError) {
    return <p className="text-red-500">Failed to load events</p>
  }

  return (
    <div className="space-y-4">
      {events?.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
        >
          <div>
            <p className="font-medium">{event.name}</p>
            <p className="text-sm text-muted-foreground">
              {event.date.toISOString().slice(0, 10)}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="hover:bg-primary hover:text-white"
            onClick={() => {
              setRegisteringId(event.id)
              mutate(event.id)
            }}
            disabled={registeringId === event.id}
          >
            {registeringId === event.id ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              'Register'
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
