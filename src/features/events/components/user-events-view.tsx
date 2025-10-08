"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconCalendar, IconUsers, IconLoader2, IconEye } from "@tabler/icons-react"
import { eventService } from "@/gateway/services"
import { Event } from "@/gateway/types/api"
import { format } from "date-fns"
import { EventRegistrationDialog } from "./event-registration-dialog"

export function UserEventsView() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false)

  const { data: userRegisteredEvents, isLoading: loadingUserEvents } = useQuery({
    queryKey: ['user-registered-events'],
    queryFn: () => eventService.getUserRegisteredEvents(),
  })

  // Filter events by status
  const upcomingEvents = userRegisteredEvents?.filter(event => event.status === 'upcoming') || []
  const ongoingEvents = userRegisteredEvents?.filter(event => event.status === 'ongoing') || []
  const completedEvents = userRegisteredEvents?.filter(event => event.status === 'completed') || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
      {event.images && event.images.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.png'
            }}
          />
          <div className="absolute top-3 right-3">
            <Badge className={`${getStatusColor(event.status)} shadow-sm`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          </div>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {event.description || "No description available"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-primary" />
              <span className="font-medium">{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-primary" />
              <span className="font-medium">{event.registeredUsersCount || 0} participants</span>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            onClick={() => {
              setSelectedEvent(event)
              setRegistrationDialogOpen(true)
            }}
          >
            <IconEye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const LoadingState = () => (
    <div className="flex justify-center items-center py-8">
      <IconLoader2 className="h-8 w-8 animate-spin" />
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
        <h2 className="text-2xl font-bold tracking-tight">My Events</h2>
        <p className="text-muted-foreground">
          View and manage your event registrations
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {loadingUserEvents ? (
            <LoadingState />
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState message="No upcoming events found" />
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          {loadingUserEvents ? (
            <LoadingState />
          ) : ongoingEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ongoingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState message="No ongoing events found" />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loadingUserEvents ? (
            <LoadingState />
          ) : completedEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  )
}
