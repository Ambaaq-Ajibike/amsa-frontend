import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconLoader2, IconPrinter, IconUsers, IconCalendar } from '@tabler/icons-react'
import { eventService, userService, utilityService } from '@/gateway/services'
import type { User, Event, EventParticipant } from '@/gateway/types/api'
import { TagCard } from './components/tag-card'
import { printTags } from './utils/print-tags'

type PerPage = 4 | 6

// ── By Unit Tab ──────────────────────────────────────────────────────────────

function ByUnitTab({ perPage }: { perPage: PerPage }) {
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [printingAll, setPrintingAll] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ['units-list'],
    queryFn: () => utilityService.getUnits(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['tag-members', selectedUnit],
    queryFn: () =>
      userService.getUsers({
        unit: selectedUnit || undefined,
        usePaging: false,
        pageSize: 1000,
      }),
    enabled: selectedUnit !== '',
  })

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['tag-members-all'],
    queryFn: () => userService.getUsers({ usePaging: false, pageSize: 2000 }),
    enabled: printingAll,
  })

  const members: User[] = data?.items ?? []
  const selectedUnitLabel = unitsData?.find((u) => u.code === selectedUnit)?.name ?? selectedUnit

  // Trigger print once all-members data finishes loading
  useEffect(() => {
    if (printingAll && allData?.items && allData.items.length > 0) {
      setIsPrinting(true)
      printTags(allData.items, perPage, 'All Units — Tags')
        .finally(() => {
          setIsPrinting(false)
          setPrintingAll(false)
        })
    }
  }, [printingAll, allData, perPage])

  async function handlePrintUnit() {
    if (members.length === 0) return
    setIsPrinting(true)
    try {
      await printTags(members, perPage, `${selectedUnitLabel} — Tags`)
    } finally {
      setIsPrinting(false)
    }
  }

  async function handlePrintAll() {
    if (allData?.items && allData.items.length > 0) {
      setIsPrinting(true)
      try {
        await printTags(allData.items, perPage, 'All Units — Tags')
      } finally {
        setIsPrinting(false)
      }
    } else {
      setPrintingAll(true)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end gap-3'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>Select unit</p>
          {unitsLoading ? (
            <div className='flex h-9 w-48 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground'>
              <IconLoader2 className='size-4 animate-spin' /> Loading…
            </div>
          ) : (
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Choose a unit…' />
              </SelectTrigger>
              <SelectContent>
                {(unitsData ?? []).map((u) => (
                  <SelectItem key={u.id} value={u.code}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          variant='outline'
          onClick={() => void handlePrintUnit()}
          disabled={!selectedUnit || isLoading || members.length === 0 || isPrinting}
          className='gap-2'
        >
          {isLoading || isPrinting ? (
            <IconLoader2 className='size-4 animate-spin' />
          ) : (
            <IconPrinter className='size-4' />
          )}
          Print {selectedUnitLabel ? `${selectedUnitLabel} ` : ''}Tags
          {members.length > 0 && ` (${members.length})`}
        </Button>

        <Button
          onClick={() => void handlePrintAll()}
          disabled={(allLoading && printingAll) || isPrinting}
          className='gap-2'
        >
          {(allLoading && printingAll) || isPrinting ? (
            <IconLoader2 className='size-4 animate-spin' />
          ) : (
            <IconPrinter className='size-4' />
          )}
          Print All Units
        </Button>
      </div>

      {isLoading && selectedUnit && (
        <div className='flex h-32 items-center justify-center'>
          <IconLoader2 className='size-8 animate-spin text-muted-foreground' />
        </div>
      )}

      {!isLoading && selectedUnit && members.length === 0 && (
        <p className='py-8 text-center text-muted-foreground'>
          No members found for {selectedUnitLabel}.
        </p>
      )}

      {members.length > 0 && (
        <div>
          <p className='mb-3 text-sm text-muted-foreground'>
            Showing {members.length} member{members.length !== 1 ? 's' : ''} — preview
          </p>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
            {members.map((member) => (
              <div key={member.id} className='h-44'>
                <TagCard user={member} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── By Event Tab ─────────────────────────────────────────────────────────────

function ByEventTab({ perPage }: { perPage: PerPage }) {
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [isPrinting, setIsPrinting] = useState(false)

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['all-events-for-tags'],
    queryFn: () => eventService.getEvents({ pageSize: 200 }),
  })

  const { data: participantsData, isLoading: participantsLoading } = useQuery({
    queryKey: ['event-participants-tags', selectedEventId],
    queryFn: () =>
      eventService.getEventParticipants({
        eventId: selectedEventId,
        pageSize: 1000,
      }),
    enabled: selectedEventId !== '',
  })

  const events: Event[] = eventsData?.items ?? []
  const participants: EventParticipant[] = participantsData?.items ?? []
  const members: User[] = participants.map((p) => p.user)
  const eventTitle = events.find((e) => e.id === selectedEventId)?.title ?? ''

  async function handlePrint() {
    if (members.length === 0) return
    setIsPrinting(true)
    try {
      await printTags(members, perPage, `${eventTitle} — Tags`)
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end gap-3'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>Select event</p>
          {eventsLoading ? (
            <div className='flex h-9 w-48 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground'>
              <IconLoader2 className='size-4 animate-spin' /> Loading…
            </div>
          ) : (
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className='w-64'>
                <SelectValue placeholder='Choose an event…' />
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          onClick={() => void handlePrint()}
          disabled={!selectedEventId || participantsLoading || members.length === 0 || isPrinting}
          className='gap-2'
        >
          {participantsLoading || isPrinting ? (
            <IconLoader2 className='size-4 animate-spin' />
          ) : (
            <IconPrinter className='size-4' />
          )}
          Print Tags
          {members.length > 0 && ` (${members.length})`}
        </Button>
      </div>

      {participantsLoading && selectedEventId && (
        <div className='flex h-32 items-center justify-center'>
          <IconLoader2 className='size-8 animate-spin text-muted-foreground' />
        </div>
      )}

      {!participantsLoading && selectedEventId && members.length === 0 && (
        <p className='py-8 text-center text-muted-foreground'>
          No registered participants found for this event.
        </p>
      )}

      {members.length > 0 && (
        <div>
          <p className='mb-3 text-sm text-muted-foreground'>
            Showing {members.length} participant{members.length !== 1 ? 's' : ''} — preview
          </p>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
            {members.map((member) => (
              <div key={member.id} className='h-44'>
                <TagCard user={member} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TagsPage() {
  const [perPage, setPerPage] = useState<PerPage>(6)

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Print Tags</h2>
            <p className='text-muted-foreground'>
              Print member ID tags by unit or by event.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Tags per page:</span>
            <Select
              value={String(perPage)}
              onValueChange={(v) => setPerPage(Number(v) as PerPage)}
            >
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='4'>4</SelectItem>
                <SelectItem value='6'>6</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>Select print mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='unit'>
              <TabsList className='mb-4'>
                <TabsTrigger value='unit' className='gap-2'>
                  <IconUsers className='size-4' /> By Unit
                </TabsTrigger>
                <TabsTrigger value='event' className='gap-2'>
                  <IconCalendar className='size-4' /> By Event
                </TabsTrigger>
              </TabsList>

              <TabsContent value='unit'>
                <ByUnitTab perPage={perPage} />
              </TabsContent>

              <TabsContent value='event'>
                <ByEventTab perPage={perPage} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
