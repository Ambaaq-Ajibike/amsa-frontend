import { Cross2Icon, DownloadIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { PresenceFilter } from './presence-filter'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  isPresent?: boolean | null
  onIsPresentChange?: (value: boolean | null) => void
  onExport?: () => void
}

export function DataTableToolbar<TData>({
  table,
  isPresent,
  onIsPresentChange,
  onExport,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter users...'
          value={
            (table.getColumn('memberNumber')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('memberNumber')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {onIsPresentChange && (
            <PresenceFilter
              title='Presence'
              value={
                isPresent === null ? 'all' : 
                isPresent === true ? 'present' : 
                'absent'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  onIsPresentChange(null)
                } else if (value === 'present') {
                  onIsPresentChange(true)
                } else if (value === 'absent') {
                  onIsPresentChange(false)
                }
              }}
            />
          )}
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={[
                { label: 'Graduated', value: 'graduate' },
                { label: 'In-school', value: 'in-school' }
              ]}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center gap-x-2'>
        {onExport && (
          <Button
            variant='outline'
            size='sm'
            onClick={onExport}
            className='h-8'
          >
            <DownloadIcon className='mr-2 h-4 w-4' />
            Export Excel
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
