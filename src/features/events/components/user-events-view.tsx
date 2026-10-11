"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, UsersRound, LoaderCircle, Eye, QrCode } from "lucide-react"
import { eventService } from "@/gateway/services"
import { Event } from "@/gateway/types/api"
import { format } from "date-fns"
import { EventRegistrationDialog } from "./event-registration-dialog"
import { EventAttendeeTag } from "./event-attendee-tag"

export function UserEventsView() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false)
  const [tagEvent, setTagEvent] = useState<Event | null>(null)

  const { data: userRegisteredEvents, isLoading: loadingUserEvents } = useQuery({
    queryKey: ['user-registered-events'],
    queryFn: () => eventService.getUserRegisteredEvents(),
  })

  // Filter events by status
  const upcomingEvents = userRegisteredEvents?.filter(event => event.status === 'upcoming') || []
  const ongoingEvents = userRegisteredEvents?.filter(event => event.status === 'ongoing') || []
  const completedEvents = userRegisteredEvents?.filter(event => event.status === 'completed') || []

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="gap-0 rounded-xl py-0 shadow-none transition-colors hover:border-primary/30">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-[10px] font-bold uppercase tracking-wider">{format(new Date(event.startDate), 'MMM')}</span>
          <span className="text-lg font-bold leading-none">{format(new Date(event.startDate), 'd')}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold tracking-tight">{event.title}</h3><Badge variant="secondary" className="capitalize">{event.status}</Badge></div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description || 'AMSA event'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{format(new Date(event.startDate), 'EEEE, MMM d, yyyy')}</span>
            <span className="inline-flex items-center gap-1.5"><UsersRound className="size-3.5" />{event.registeredUsersCount || 0} participants</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-52 sm:shrink-0">
          <Button variant="outline" size="sm" onClick={() => { setSelectedEvent(event); setRegistrationDialogOpen(true) }}><Eye className="mr-2 size-4" />Details</Button>
          <Button size="sm" onClick={() => setTagEvent(event)}><QrCode className="mr-2 size-4" />My tag</Button>
        </div>
      </div>
    </Card>
  )

  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <LoaderCircle className="size-6 animate-spin" />
    </div>
  )

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-8">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold">Your registrations</h2>
        <p className="text-sm text-muted-foreground">Your event passes and registration details.</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid h-10 w-full max-w-lg grid-cols-3 rounded-xl">
          <TabsTrigger value="upcoming">Upcoming <span className="ml-1 text-xs text-muted-foreground">{upcomingEvents.length}</span></TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing <span className="ml-1 text-xs text-muted-foreground">{ongoingEvents.length}</span></TabsTrigger>
          <TabsTrigger value="completed">Past <span className="ml-1 text-xs text-muted-foreground">{completedEvents.length}</span></TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {loadingUserEvents ? (
            <LoadingState />
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState message="No upcoming events found" />
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-3">
          {loadingUserEvents ? (
            <LoadingState />
          ) : ongoingEvents.length > 0 ? (
            <div className="space-y-3">
              {ongoingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState message="No ongoing events found" />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {loadingUserEvents ? (
            <LoadingState />
          ) : completedEvents.length > 0 ? (
            <div className="space-y-3">
              {completedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState message="No completed events found" />
          )}
        </TabsContent>
      </Tabs>

      <EventRegistrationDialog
        event={selectedEvent}
        open={registrationDialogOpen}
        onOpenChange={setRegistrationDialogOpen}
      />
      {tagEvent && <EventAttendeeTag event={tagEvent} open={!!tagEvent} onOpenChange={(open) => { if (!open) setTagEvent(null) }} />}
    </div>
  )
}
