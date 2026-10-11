'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarDays, Check, Clock3, LoaderCircle, UsersRound } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { eventService } from '@/gateway/services'
import { showErrorToast, showSuccessToast } from '@/utils/error-handler'
import type { Event } from '@/gateway/types/api'

export function EventsList() {
  const queryClient = useQueryClient()
  const [registeringId, setRegisteringId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['all-events'],
    queryFn: () => eventService.getAllEvents(),
  })
  const { data: registeredEvents } = useQuery({
    queryKey: ['user-registered-events'],
    queryFn: () => eventService.getUserRegisteredEvents(),
  })
  const register = useMutation({
    mutationFn: (eventId: string) => eventService.registerForEvent(eventId),
    onSuccess: () => {
      showSuccessToast('Event registration successful')
      setRegisteringId(null)
      setSelectedEvent(null)
      void queryClient.invalidateQueries({ queryKey: ['all-events'] })
      void queryClient.invalidateQueries({ queryKey: ['user-registered-events'] })
    },
    onError: (error: unknown) => {
      showErrorToast(error)
      setRegisteringId(null)
      setSelectedEvent(null)
    },
  })

  if (isLoading) return <div className="flex h-36 items-center justify-center text-muted-foreground"><LoaderCircle className="size-6 animate-spin" /></div>
  if (isError) return <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Events could not be loaded. Please try again.</p>
  if (!events?.length) return <div className="rounded-xl border border-dashed p-10 text-center"><CalendarDays className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-3 font-semibold">No events yet</h3><p className="mt-1 text-sm text-muted-foreground">New AMSA events will appear here.</p></div>

  const registeredIds = new Set(registeredEvents?.map((event) => event.id))
  const statusClass = (status: string) => {
    if (status === 'upcoming') return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200'
    if (status === 'ongoing') return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
    return 'border-muted bg-muted text-muted-foreground'
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const isRegistered = registeredIds.has(event.id)
        const canRegister = event.status === 'upcoming' || event.status === 'ongoing'
        const startsAt = new Date(event.startDate)
        const endsAt = new Date(event.endDate)

        return (
          <Card key={event.id} className="gap-0 overflow-hidden rounded-xl py-0 shadow-none transition-colors hover:border-primary/30">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex shrink-0 items-center gap-3 sm:w-28 sm:flex-col sm:items-start sm:gap-2">
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-14">
                  <span className="text-[10px] font-bold uppercase tracking-wider">{format(startsAt, 'MMM')}</span>
                  <span className="text-lg font-bold leading-none">{format(startsAt, 'd')}</span>
                </div>
                <Badge variant="outline" className={`capitalize ${statusClass(event.status)}`}>{event.status}</Badge>
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-4">
                {event.images?.[0] && <img src={event.images[0]} alt="" className="hidden size-16 shrink-0 rounded-lg object-cover sm:block" />}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold tracking-tight sm:text-lg">{event.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description || 'Join the AMSA community for this event.'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{format(startsAt, 'EEEE, MMM d, yyyy')}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{format(startsAt, 'h:mm a')} – {format(endsAt, 'h:mm a')}</span>
                    <span className="inline-flex items-center gap-1.5"><UsersRound className="size-3.5" />{event.registeredUsersCount} registered</span>
                  </div>
                </div>
              </div>

              <div className="sm:ml-auto sm:w-36 sm:shrink-0">
                {isRegistered ? (
                  <Button variant="outline" className="w-full" disabled><Check className="mr-2 size-4" />Registered</Button>
                ) : canRegister ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button className="w-full" onClick={() => setSelectedEvent(event)}>Register</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Register for this event?</AlertDialogTitle><AlertDialogDescription>Confirm your registration for {selectedEvent?.title ?? event.title}.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedEvent(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={register.isPending} onClick={() => { setRegisteringId(event.id); register.mutate(event.id) }}>
                          {registeringId === event.id && <LoaderCircle className="mr-2 size-4 animate-spin" />}Confirm registration
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : <Button variant="outline" className="w-full" disabled>Registration closed</Button>}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
