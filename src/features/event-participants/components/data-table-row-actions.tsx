import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUsers } from '../context/users-context'
import { Participants } from '../data/schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postRequest } from '@/gateway/apiService'
import { toast } from 'sonner'
import { useSearch } from '@tanstack/react-router'

interface DataTableRowActionsProps {
  row: Row<Participants>
}

async function markPresent(eventId: string, userId: string) {
  return postRequest<{ success: boolean }>(`/events/${eventId}/users/${userId}/mark-present`, {})
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  const search = useSearch({ from: '/_authenticated/event-participants/' })
  const event = (search as any)?.event
  const queryClient = useQueryClient()

  const { mutate: markPresentMutation, isPending } = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) => 
      markPresent(eventId, userId),
    onSuccess: () => {
      toast.success('Member marked as present')
      queryClient.invalidateQueries({ queryKey: ['participants', event] })
    },
    onError: () => {
      toast.error('Failed to mark member as present')
    },
  })

  const handleMarkPresent = () => {
    if (event) {
      markPresentMutation({ eventId: event, userId: row.original.userId })
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={handleMarkPresent}
            disabled={isPending}
          >
            {isPending ? 'Marking...' : 'Mark Present'}
            <DropdownMenuShortcut>
              <IconCheck size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            Remove
            <DropdownMenuShortcut>
              <IconTrash size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
