import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { userService } from '@/gateway/services'

export default function Users() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [unit, _setUnit] = useState('')
  const [state, _setState] = useState('')

  // Debounce the keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
    }, 500)

    return () => clearTimeout(timer)
  }, [keyword])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, pageSize, debouncedKeyword, unit, state],
    queryFn: () => userService.getUsers({
      page,
      pageSize,
      keyword: debouncedKeyword || undefined,
      unit: unit || undefined,
      state: state || undefined,
      usePaging: true,
    }),
  })

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Member List</h2>
            <p className='text-muted-foreground'>
              Manage your members and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isError && <p className='text-red-500'>Failed to load members</p>}
          <UsersTable 
            data={data?.items || []} 
            columns={columns}
            page={data?.page || 1}
            pageSize={data?.pageSize || 20}
            totalItems={data?.totalItems || 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onKeywordChange={setKeyword}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
