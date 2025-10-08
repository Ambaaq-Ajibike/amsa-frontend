import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const activities = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    avatar: '/avatars/01.png',
    fallback: 'OM',
    activity: 'Logged in',
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    avatar: '/avatars/02.png',
    fallback: 'JL',
    activity: 'Purchased membership',
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    avatar: '/avatars/03.png',
    fallback: 'IN',
    activity: 'Submitted form',
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    avatar: '/avatars/04.png',
    fallback: 'WK',
    activity: 'Made a donation',
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    avatar: '/avatars/05.png',
    fallback: 'SD',
    activity: 'Registered for event',
  },
]

export function RecentActivities() {
  return (
    <div className='space-y-8'>
      {activities.map(({ id, name, email, avatar, fallback, activity }) => (
        <div key={id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{name}</p>
              <p className='text-muted-foreground text-sm'>{email}</p>
            </div>
            <div className='font-medium'>{activity}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
