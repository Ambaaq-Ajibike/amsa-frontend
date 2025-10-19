"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { showSuccessToast, showErrorToast } from "@/utils/error-handler"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { IconCalendar, IconUsers, IconLoader } from "@tabler/icons-react"
import { eventService } from "@/gateway/services"
import { Event } from "@/gateway/types/api"
import { format } from "date-fns"

interface EventRegistrationDialogProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventRegistrationDialog({ event, open, onOpenChange }: EventRegistrationDialogProps) {
  const queryClient = useQueryClient()
  const [isRegistering, setIsRegistering] = useState(false)

  const { mutateAsync: registerForEvent } = useMutation({
    mutationFn: eventService.registerForEvent,
    onSuccess: (data: unknown) => {
      const message = (data as { message?: string })?.message || "Successfully registered for the event!"
      showSuccessToast(message)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['user-events'] })
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      showErrorToast(error)
    },
  })

  const handleRegister = async () => {
    if (!event) return
    
    setIsRegistering(true)
    try {
      await registerForEvent(event.id)
    } finally {
      setIsRegistering(false)
    }
  }

  if (!event) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{event.title}</DialogTitle>
          <DialogDescription>
            Register for this AMSA event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Status */}
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {event.registeredUsersCount} registered
            </span>
          </div>

          {/* Event Description */}
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          )}

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.startDate), 'PPP p')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.endDate), 'PPP p')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IconUsers className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-sm text-muted-foreground">
                  {event.registeredUsersCount} registered
                </p>
              </div>
            </div>
          </div>

          {/* Event Images */}
          {event.images && event.images.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Event Images</h4>
              <div className="grid grid-cols-2 gap-2">
                {event.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Event image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
