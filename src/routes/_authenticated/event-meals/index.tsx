import { createFileRoute } from '@tanstack/react-router'
import EventMeals from '@/features/event-meals'

export const Route = createFileRoute('/_authenticated/event-meals/')({
  component: EventMeals,
})
