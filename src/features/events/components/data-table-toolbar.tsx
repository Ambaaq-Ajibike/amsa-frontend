import { Cross2Icon, DownloadIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTableViewOptions } from '../components/data-table-view-options'
import { statuses } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    onStatusChange?: (status: string | null) => void
    onKeywordChange?: (keyword: string) => void
    onExport?: () => void
}

export function DataTableToolbar<TData>({
    table,
    onStatusChange,
    onKeywordChange,
    onExport,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const statusFilter = table.getColumn('status')?.getFilterValue() as string[]

    const getStatusLabel = (status: string) => {
        const statusOption = statuses.find(s => s.value === status)
        return statusOption?.label || status
    }

    return (
        <div className='space-y-4'>
            {/* Active Filters Display */}
            {(isFiltered || statusFilter?.length > 0) && (
                <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>Active filters:</span>
                    {statusFilter?.length > 0 && (
                        <Badge variant="secondary" className="gap-1">
                            Status: {statusFilter.map(getStatusLabel).join(', ')}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                    table.getColumn('status')?.setFilterValue(undefined)
                                    onStatusChange?.(null)
                                }}
                            >
                                <Cross2Icon className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                    <Button
                        variant='ghost'
                        size="sm"
                        onClick={() => {
                            table.resetColumnFilters()
                            onStatusChange?.(null)
                        }}
                        className='h-6 px-2 text-xs'
                    >
                        Clear all filters
                        <Cross2Icon className='ml-1 h-3 w-3' />
                    </Button>
                </div>
            )}

            {/* Filter Controls */}
            <div className='flex items-center justify-between'>
                <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
                    <Input
                        placeholder='Search events...'
                        onChange={(event) => {
                            const value = event.target.value
                            onKeywordChange?.(value)
                        }}
                        className='h-8 w-[150px] lg:w-[250px]'
                    />
                    <div className='flex gap-x-2'>
                        {table.getColumn('status') && (
                            <DataTableFacetedFilter
                                column={table.getColumn('status')}
                                title='Status'
                                options={statuses}
                                onChange={(values) => {
                                    const selected = values[0] || null
                                    onStatusChange?.(selected)
                                }}
                            />
                        )}
                    </div>
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
        </div>
    )
}
