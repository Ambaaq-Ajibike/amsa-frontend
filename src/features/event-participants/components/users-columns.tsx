import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LongText from '@/components/long-text'
import { Participants } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { IconCheck, IconLoader } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventService } from '@/gateway/services'
import { toast } from 'sonner'

// Mark Present Button Component
function MarkPresentButton({ participant, eventId }: { participant: Participants; eventId: string }) {
  const queryClient = useQueryClient()
  
  const { mutateAsync: markPresent, isPending } = useMutation({
    mutationFn: () => eventService.markParticipantPresent(eventId, participant.userId),
    onSuccess: () => {
      toast.success(`${participant.firstName} ${participant.lastName} marked as present`)
      queryClient.invalidateQueries({ queryKey: ['event-participants', eventId] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark participant as present')
    },
  })

  if (participant.markedPresent) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <IconCheck className="h-3 w-3 mr-1" />
        Present
      </Badge>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => markPresent()}
      disabled={isPending}
      className="h-7 px-2 text-xs"
    >
      {isPending ? (
        <IconLoader className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <IconCheck className="h-3 w-3 mr-1" />
      )}
      Mark Present
    </Button>
  )
}

export const createColumns = (eventId: string): ColumnDef<Participants>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'memberNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='MemberNumber' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-20'>{row.getValue('memberNumber')}</LongText>
    ),
    meta: {
      className: cn(
        'w-20 drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-6 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original
      const fullName = `${firstName} ${lastName}`
      return <LongText className='max-w-36'>{fullName}</LongText>
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Number' />
    ),
    cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'unit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unit' />
    ),
    cell: ({ row }) => <div>{row.getValue('unit')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'isPresent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <MarkPresentButton 
        participant={row.original} 
        eventId={eventId} 
      />
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]

// Backward compatibility - export default columns with a default eventId
export const columns: ColumnDef<Participants>[] = createColumns('default-event-id')
