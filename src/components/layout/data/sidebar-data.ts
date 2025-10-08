import {
  IconCalendar,
  IconChecklist,
  IconLayoutDashboard,
  IconPackages,
  IconSettings,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'
import { PERMISSIONS, ROLES } from '@/lib/permissions'

// Static sidebar data
export const staticSidebarData: SidebarData = {
  user: {
    name: 'Ahmad',
    email: 'ahmad@gmail.com',
    avatar: '/images/amsa-logo.png',
  },
  teams: [
    {
      name: 'AMSA NIGERIA',
      logo: '/images/amsa-logo.jpg',
      plan: 'AMSA TAJNEED PORTAL',
    },
  ],
  navGroups: [],
}

// Function to generate dynamic sidebar data based on user permissions and roles
export function getSidebarData(permissions: string[] = [], roles: string[] = []): SidebarData {
  const generalItems = []

  // Only show Dashboard and Apps for Admin or Tajneed roles
  const hasAdminOrTajneedRole = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.TAJNEED)
  
  if (hasAdminOrTajneedRole) {
    generalItems.push({
      title: 'Dashboard',
      url: '/dashboard' as const,
      icon: IconLayoutDashboard,
    })
  }

  // Add Members if user has CanViewUsers permission
  if (permissions.includes(PERMISSIONS.CAN_VIEW_USERS)) {
    generalItems.push({
      title: 'Members',
      url: '/members' as const,
      icon: IconUsers,
    })
  }

  // Add Events if user has CanCheckInEvent permission
  if (permissions.includes(PERMISSIONS.CAN_CHECK_IN_EVENT)) {
    generalItems.push({
      title: 'Events',
      url: '/events' as const,
      icon: IconChecklist,
    })
  }

  // Only show Apps for Admin or Tajneed roles
  if (hasAdminOrTajneedRole) {
    generalItems.push({
      title: 'Apps',
      url: '/apps' as const,
      icon: IconPackages,
    })
  }

  const navGroups = [
    {
      title: 'General',
      items: generalItems,
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings' as const,
              icon: IconUserCog,
            },
            {
              title: 'Events',
              url: '/settings/events' as const,
              icon: IconCalendar,
            },
          ],
        },
      ],
    },
  ]

  return {
    ...staticSidebarData,
    navGroups,
  }
}

// Default export for backward compatibility
export const sidebarData = staticSidebarData
