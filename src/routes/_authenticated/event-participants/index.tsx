import EventParticipants from '@/features/event-participants'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_authenticated/event-participants/')({
  component: EventParticipants,
})
