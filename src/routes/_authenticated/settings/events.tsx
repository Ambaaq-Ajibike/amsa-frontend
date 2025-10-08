import { createFileRoute } from '@tanstack/react-router'
import SettingsEvents from '@/features/settings/events'

export const Route = createFileRoute('/_authenticated/settings/events')({
  component: SettingsEvents,
})
