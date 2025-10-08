"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconLoader, IconCheck } from "@tabler/icons-react"
import { eventService } from "@/gateway/services"
import { EventParticipant } from "@/gateway/types/api"
import { format } from "date-fns"

interface CheckInDialogProps {
  participant: EventParticipant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckInDialog({ participant, open, onOpenChange }: CheckInDialogProps) {
  const queryClient = useQueryClient()
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  const { mutateAsync: markPresent } = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventService.markParticipantPresent(eventId, userId),
    onSuccess: () => {
      toast.success("Participant checked in successfully!")
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to check in participant")
    },
  })

  const handleCheckIn = async () => {
    if (!participant) return
    
    setIsCheckingIn(true)
    try {
      await markPresent({
        eventId: participant.eventId,
        userId: participant.userId,
      })
    } finally {
      setIsCheckingIn(false)
    }
  }

  if (!participant) return null

  const user = participant.user
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Check In Participant</DialogTitle>
          <DialogDescription>
            Mark this participant as present for the event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Participant Info */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Member No: {user.memberNo}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{user.unit}</Badge>
                <Badge variant="outline">{user.state}</Badge>
              </div>
            </div>
          </div>

          {/* Registration Info */}
          <div className="space-y-2">
            <h4 className="font-medium">Registration Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Registered At</p>
                <p>{format(new Date(participant.registeredAt), 'PPP p')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge 
                  className={participant.isPresent 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {participant.isPresent ? "Present" : "Not Present"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Check-in Status */}
          {participant.isPresent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <IconCheck className="h-4 w-4" />
                <span className="font-medium">Already Checked In</span>
              </div>
              {participant.checkedInAt && (
                <p className="text-sm text-green-600 mt-1">
                  Checked in at: {format(new Date(participant.checkedInAt), 'PPP p')}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCheckIn} 
            disabled={isCheckingIn || participant.isPresent}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCheckingIn ? (
              <>
                <IconLoader className="h-4 w-4 animate-spin mr-2" />
                Checking In...
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4 mr-2" />
                Check In
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
