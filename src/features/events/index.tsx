'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import TasksProvider from './context/tasks-context'
import { eventService } from '@/gateway/services'

interface Event {
  id: string
  title: string
  startDate: string
  endDate: string
  description: string
  status: string
}

export interface EventResponse {
  items: Event[]
  totalItems: number
  page: number
  pageSize: number
  totalPages: number
}

async function getEvents(status: string | null, keyword: string | null, page: number, pageSize: number) {
  return eventService.getEvents({
    status: status as 'upcoming' | 'ongoing' | 'completed' | undefined,
    keyword: keyword || undefined,
    page,
    pageSize,
  })
}

export default function Events() {
  const [status, setStatus] = useState<string | null>(null) // no filter initially
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Debounce the keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
    }, 500)

    return () => clearTimeout(timer)
  }, [keyword])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', page, pageSize, status, debouncedKeyword],
    queryFn: () => getEvents(status, debouncedKeyword, page, pageSize),
  })

  return (
    <TasksProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Events</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of AMSA events
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isError && <p className='text-red-500'>Failed to load events</p>}
          <DataTable
            data={data?.items?.map(event => ({
              id: event.id,
              name: event.title,
              theme: event.description || '',
              date: new Date(event.startDate),
              status: event.status,
            })) || []}
            columns={columns}
            page={data?.page || 1}
            pageSize={data?.pageSize || 20}
            totalItems={data?.totalItems || 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onStatusChange={(status) => setStatus(status || null)}
            onKeywordChange={setKeyword}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
