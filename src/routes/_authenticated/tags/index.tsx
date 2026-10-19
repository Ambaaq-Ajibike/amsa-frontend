import { createFileRoute } from '@tanstack/react-router'
import TagsPage from '@/features/tags'

export const Route = createFileRoute('/_authenticated/tags/')({
  component: TagsPage,
})
