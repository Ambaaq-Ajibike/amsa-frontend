'use client'

import { useQuery } from '@tanstack/react-query'

import { useSearch } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { createColumns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { ParticipantsTable } from './components/participants-table'
import UsersProvider from './context/users-context'
import { eventService } from '@/gateway/services'
import { IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'




async function getParticipants(eventId: string, page: number, pageSize: number) {
  return eventService.getEventParticipants({
    eventId,
    page,
    pageSize,
  })
}

export default function EventParticipants() {
  const search = useSearch({ from: '/_authenticated/event-participants/' })
  const event = (search as any)?.event
  const [page] = useState(1)
  const [pageSize] = useState(20)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['participants', event, page, pageSize],
    queryFn: () => getParticipants(event, page, pageSize),
    enabled: !!event, // only run if eventId exists
  })

  // Event data - you might need to fetch this separately or pass it as a prop
  const eventData = {
    title: 'Event Participants',
    description: 'Manage event participants',
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{eventData.title}</h2>
            <p className="text-muted-foreground">{eventData.description}</p>
          </div>
          {/* <UsersPrimaryButtons /> */}
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading && (
            <div className="flex justify-center items-center">
              <IconLoader2 size={70} className="animate-spin" />
            </div>
          )}
          {isError && <p className="text-red-500">Failed to load participants</p>}
          {data && (
            <ParticipantsTable
              data={data.items.map((p) => ({
                userId: p.userId,
                memberNumber: p.user.memberNo,
                firstName: p.user.firstName,
                lastName: p.user.lastName,
                email: p.user.email,
                phoneNumber: p.user.phone,
                unit: p.user.unit,
                isPresent: p.isPresent || false, // Mock false if not present in response
              }))}
              columns={createColumns(event)}
            />
          )}
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
