'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { eventService } from '@/gateway/services'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { IconLoader2, IconCalendar, IconClock } from '@tabler/icons-react'
import { format } from 'date-fns'
import type { Event } from '@/gateway/types/api'



async function getAllEvents() {
  // Use the same endpoint as the events table with a large page size to get all events
  const res = await eventService.getEvents({ page: 1, pageSize: 1000 })
  return res.items
}


async function registerEvent(eventId: string) {
  return eventService.registerForEvent(eventId)
}

export function EventsList() {
  const queryClient = useQueryClient()
  const [registeringId, setRegisteringId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const { data: events, isLoading: eventsLoading, isError: eventsError } = useQuery({
    queryKey: ['all-events'],
    queryFn: getAllEvents,
  })

  // Since both getAllEvents and getUserEvents now use the same endpoint,
  // we can remove the separate user events query and use a single events query
  // const { data: userEvents, isLoading: userEventsLoading } = useQuery({
  //   queryKey: ['user-events'],
  //   queryFn: getUserEvents,
  // })

  const { mutate: registerMutation } = useMutation({
    mutationFn: registerEvent,
    onSuccess: () => {
      showSubmittedData('Event Registration Successful!')
      setRegisteringId(null)
      setSelectedEvent(null)
      queryClient.invalidateQueries({ queryKey: ['all-events'] })
    },
    onError: () => {
      showSubmittedData('Event Registration Failed!')
      setRegisteringId(null)
      setSelectedEvent(null)
    },
  })

  const isLoading = eventsLoading

  if (isLoading) {
    return (
      <div className='flex h-32 items-center justify-center'>
        <IconLoader2 className='size-8 animate-spin' />
      </div>
    )
  }

  if (eventsError) {
    return <p className='text-red-500'>Failed to load events</p>
  }

  // Since we're using the same endpoint for both all events and user events,
  // we'll need to determine user registration status differently
  // For now, we'll assume user is not registered and allow registration for upcoming events
  const isUserRegistered = (_eventId: string) => {
    // TODO: Implement proper user registration checking
    // This might require a separate API call to get user's registered events
    return false
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRegister = (event: Event) => {
    setSelectedEvent(event)
  }

  const confirmRegistration = () => {
    if (selectedEvent) {
      setRegisteringId(selectedEvent.id)
      registerMutation(selectedEvent.id)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {events?.map((event) => {
          const isRegistered = isUserRegistered(event.id)
          
          return (
            <Card key={event.id} className='group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
              {/* Event Image */}
              {event.images && event.images.length > 0 && (
                <div className='relative h-48 overflow-hidden'>
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                  <div className='absolute top-3 right-3'>
                    <Badge className={`${getStatusColor(event.status)} shadow-lg backdrop-blur-sm border-0`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                </div>
              )}
              
              <CardHeader className='pb-3'>
                <div className='space-y-2'>
                  <CardTitle className='text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2'>
                    {event.title}
                  </CardTitle>
                  <CardDescription className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
                    {event.description || 'No description available'}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className='pt-0 space-y-4'>
                {/* Event Details */}
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 text-sm'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <IconCalendar className='h-4 w-4 text-primary' />
                      <span className='font-medium'>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 text-sm'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <IconClock className='h-4 w-4 text-primary' />
                      <span className='font-medium'>
                        {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className='pt-2'>
                  {isRegistered ? (
                    <Button variant='outline' className='w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100' disabled>
                      ✓ Registered
                    </Button>
                  ) : event.status === 'upcoming' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          className='w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
                          onClick={() => handleRegister(event)}
                        >
                          Register Now
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Event Registration</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to register for "{selectedEvent?.title}"? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={confirmRegistration}
                            disabled={registeringId === selectedEvent?.id}
                          >
                            {registeringId === selectedEvent?.id ? (
                              <IconLoader2 className='size-4 animate-spin mr-2' />
                            ) : null}
                            Confirm Registration
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button variant='outline' className='w-full bg-gray-50 text-gray-500 border-gray-200' disabled>
                      Registration Closed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {events?.length === 0 && (
        <div className='text-center py-12'>
          <div className='mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4'>
            <IconCalendar className='w-12 h-12 text-muted-foreground' />
          </div>
          <h3 className='text-lg font-semibold text-muted-foreground mb-2'>No events available</h3>
          <p className='text-muted-foreground'>Check back later for upcoming events.</p>
        </div>
      )}
    </div>
  )
}
