import type { User } from '@/gateway/types/api'

interface TagCardProps {
  user: User
}

export function TagCard({ user }: TagCardProps) {
  return (
    <div className='flex h-full w-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm'>
      <div className='flex items-center gap-2 bg-green-700 px-3 py-2'>
        <img
          src='/images/amsa-logo.png'
          alt='AMSA'
          className='h-8 w-8 rounded-full object-contain bg-white p-0.5'
        />
        <div>
          <p className='text-xs font-bold text-white'>AMSA NIGERIA</p>
          <p className='text-[10px] text-green-200'>Tajneed Portal</p>
        </div>
      </div>

      <div className='flex flex-1 flex-col justify-center px-3 py-2 space-y-1'>
        <p className='font-bold text-gray-900 leading-tight' style={{ fontSize: '13px' }}>
          {user.firstName} {user.lastName}
        </p>
        <p className='text-gray-500' style={{ fontSize: '11px' }}>
          No: <span className='font-semibold text-gray-700'>{user.memberNo}</span>
        </p>
        <p className='text-gray-500' style={{ fontSize: '11px' }}>
          Unit: <span className='font-medium text-gray-700'>{user.unit}</span>
        </p>
        {user.state && (
          <p className='text-gray-500' style={{ fontSize: '11px' }}>
            State: <span className='font-medium text-gray-700'>{user.state}</span>
          </p>
        )}
      </div>

      <div className='bg-green-50 px-3 py-1.5 border-t border-green-100'>
        <p className='text-center text-green-700' style={{ fontSize: '9px' }}>
          {user.roles?.length > 0 ? user.roles[0] : 'Member'}
        </p>
      </div>
    </div>
  )
}
