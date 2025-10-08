"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  IconCalendar, 
  IconUsers, 
  IconLoader2,
  IconUserCheck,
  IconSchool
} from "@tabler/icons-react"
import { utilityService } from "@/gateway/services"
import { Overview } from "./overview"


export function DashboardOverview() {
  // Fetch statistics data
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: () => utilityService.getStatistics(),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <IconLoader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalEvents = statistics?.totalEvents || 0
  const totalActiveUsers = statistics?.totalActiveUsers || 0
  const totalAlumni = statistics?.totalAlumni || 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All time events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <IconUserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumni</CardTitle>
            <IconSchool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlumni}</div>
            <p className="text-xs text-muted-foreground">
              AMSA alumni members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveUsers + totalAlumni}</div>
            <p className="text-xs text-muted-foreground">
              Active + Alumni members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Registrations</CardTitle>
          <CardDescription>
            Member registrations per month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <Overview data={statistics?.registrationsPerMonth} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
