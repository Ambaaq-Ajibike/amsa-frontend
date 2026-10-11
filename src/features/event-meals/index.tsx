import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { EventWorkspacePicker } from '@/features/events/components/event-workspace-picker'
import { useEventSelection } from '@/features/events/use-event-selection'
import { EventMealsPanel } from '@/features/event-participants/components/event-meals-panel'
import { EventQrScannerDialog } from '@/features/event-participants/components/event-qr-scanner-dialog'
import { usePermissions } from '@/lib/permissions'
import { Utensils } from 'lucide-react'

export default function EventMeals() {
  const { events, eventId, setEventId, selectedEvent, isLoading, isError } = useEventSelection()
  const [scannerOpen, setScannerOpen] = useState(false)
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canManageMeals = hasPermission('CanCreateEvent')
  const canScanMeals = hasPermission('CanScanMeals')

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4"><ThemeSwitch /><ProfileDropdown /></div>
      </Header>
      <Main fixed className="gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Event operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Event meals</h1><p className="text-muted-foreground">Configure meal windows and track collection at the door.</p></div>
          {eventId && canScanMeals && <Button onClick={() => setScannerOpen(true)}><Utensils className="mr-2 size-4" />Scan meal</Button>}
        </div>
        <EventWorkspacePicker events={events} eventId={eventId} onEventChange={setEventId} isLoading={isLoading} isError={isError} selectedEvent={selectedEvent} />
        {eventId && (canManageMeals || canScanMeals) ? <EventMealsPanel eventId={eventId} canManage={canManageMeals} /> : !isLoading && !isError && !events.length ? <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">No events are available yet.</div> : !canManageMeals && !canScanMeals ? <p className="rounded-xl border p-5 text-sm text-muted-foreground">You do not have permission to manage or scan event meals.</p> : null}
      </Main>
      {eventId && scannerOpen && <EventQrScannerDialog key={eventId} eventId={eventId} mode="meal" open={scannerOpen} onOpenChange={setScannerOpen} onScanned={() => { void queryClient.invalidateQueries({ queryKey: ['event-meals', eventId] }) }} />}
    </>
  )
}
