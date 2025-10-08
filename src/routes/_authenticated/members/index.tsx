import { createFileRoute } from '@tanstack/react-router'
import Users from '@/features/members'

export const Route = createFileRoute('/_authenticated/members/')({
  component: Users,
})
