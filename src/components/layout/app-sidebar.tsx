import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { getSidebarData } from './data/sidebar-data'
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/gateway/services'
import { useAuthStore } from '@/stores/authStore'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userService.getProfile,
  })

  // Get user permissions and roles from auth store
  const authUser = useAuthStore((state) => state.auth.user)
  const permissions = authUser?.permissions || []
  const roles = authUser?.roles || []

  // Generate dynamic sidebar data based on permissions and roles
  const dynamicSidebarData = getSidebarData(permissions, roles)

  // Create user object for NavUser component
  const user = userProfile ? {
    name: `${userProfile.firstName} ${userProfile.lastName}`,
    email: userProfile.email,
    avatar: '/images/amsa-logo.png', // Default avatar
  } : {
    name: authUser?.name || 'User',
    email: authUser?.chandaNo || '',
    avatar: '/images/amsa-logo.png',
  }

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={dynamicSidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {dynamicSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
