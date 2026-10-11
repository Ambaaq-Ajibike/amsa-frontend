import { CalendarDays, LoaderCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Event } from '@/gateway/types/api'

interface Props {
  events: Event[]
  eventId: string
  onEventChange: (eventId: string) => void
  isLoading: boolean
  isError: boolean
  selectedEvent?: Event
}

export function EventWorkspacePicker({ events, eventId, onEventChange, isLoading, isError, selectedEvent }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="size-5" /></div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Selected event</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold">{selectedEvent?.title ?? (isLoading ? 'Loading events…' : 'Choose an event')}</p>
            {selectedEvent && <Badge variant="secondary" className="capitalize">{selectedEvent.status}</Badge>}
          </div>
          {selectedEvent && <p className="mt-1 text-xs text-muted-foreground">{new Date(selectedEvent.startDate).toLocaleDateString()}</p>}
        </div>
      </div>
      <Select value={eventId || undefined} onValueChange={onEventChange} disabled={isLoading || events.length === 0}>
        <SelectTrigger className="w-full sm:w-[280px]" aria-label="Select event">
          <SelectValue placeholder={isLoading ? 'Loading events…' : 'Select an event'} />
          {isLoading && <LoaderCircle className="size-4 animate-spin" />}
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => <SelectItem key={event.id} value={event.id}>{event.title} · {event.status}</SelectItem>)}
        </SelectContent>
      </Select>
      {isError && <p role="alert" className="text-sm text-destructive">Events could not be loaded.</p>}
    </div>
  )
}
