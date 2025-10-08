'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { roleService, userService } from '@/gateway/services'
import { IconLoader2 } from '@tabler/icons-react'
import { User as UserType } from '../data/schema'
import type { RoleAndPermission } from '@/gateway/types/api'
import { format } from 'date-fns'

const assignRoleSchema = z.object({
  roleName: z.string().min(1, 'Please select a role'),
  permissionLevel: z.enum(['unit', 'state', 'national'], {
    required_error: 'Please select a permission level',
  }),
})

type AssignRoleFormData = z.infer<typeof assignRoleSchema>

interface UserDetails {
  id: string
  memberNo: string
  dob: string
  firstName: string
  lastName: string
  email: string
  unit: string
  phone: string
  state: string
  status: string
  userRoles: Array<{
    roleId: string
    role: {
      name: string
    }
    permissionLevel: string
  }>
}

interface UsersViewDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: UserType
}

export function UsersViewDetailsDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersViewDetailsDialogProps) {
  const [assignedRoles, setAssignedRoles] = useState<RoleAndPermission[]>([])
  const [showAssignRole, setShowAssignRole] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<AssignRoleFormData>({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: {
      roleName: '',
      permissionLevel: 'unit',
    },
  })

  // Fetch user details
  const { data: userDetails, isLoading: loadingUserDetails } = useQuery({
    queryKey: ['user-details', currentRow.id],
    queryFn: () => userService.getUserById(currentRow.id),
    enabled: open,
  }) as { data: UserDetails | undefined, isLoading: boolean }

  // Fetch available roles
  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAllRoles(),
  })

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: (data: { userId: string; rolePermissions: RoleAndPermission[] }) =>
      userService.assignUserRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-details', currentRow.id] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      setAssignedRoles([])
      form.reset()
      setShowAssignRole(false)
    },
  })

  const onSubmit = (data: AssignRoleFormData) => {
    const newRole: RoleAndPermission = {
      roleName: data.roleName,
      permissionLevel: data.permissionLevel,
    }
    
    setAssignedRoles(prev => [...prev, newRole])
    form.reset()
  }

  const removeRole = (index: number) => {
    setAssignedRoles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAssignRoles = () => {
    if (assignedRoles.length === 0) return
    
    assignRoleMutation.mutate({
      userId: currentRow.id,
      rolePermissions: assignedRoles,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
      case 'national':
        return 'bg-purple-100 text-purple-800'
      case 'state':
        return 'bg-blue-100 text-blue-800'
      case 'unit':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Member Details
          </DialogTitle>
          <DialogDescription>
            View and manage member information and roles
          </DialogDescription>
        </DialogHeader>

        {loadingUserDetails ? (
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </div>
                    <p className="font-medium">{userDetails.firstName} {userDetails.lastName}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Member Number</span>
                    </div>
                    <p className="font-medium">{userDetails.memberNo}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{userDetails.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </div>
                    <p className="font-medium">{userDetails.phone}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Unit</span>
                    </div>
                    <p className="font-medium">{userDetails.unit}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>State</span>
                    </div>
                    <p className="font-medium">{userDetails.state}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Date of Birth</span>
                    </div>
                    <p className="font-medium">{format(new Date(userDetails.dob), 'MMM dd, yyyy')}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Status</span>
                    </div>
                    <Badge className={getStatusColor(userDetails.status)}>
                      {userDetails.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Roles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Current Roles</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAssignRole(!showAssignRole)}
                  >
                    {showAssignRole ? 'Cancel' : 'Assign Role'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userDetails.userRoles && userDetails.userRoles.length > 0 ? (
                  <div className="space-y-3">
                    {userDetails.userRoles.map((userRole, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-medium">
                            {userRole.role.name}
                          </Badge>
                          <Badge className={getPermissionLevelColor(userRole.permissionLevel)}>
                            {userRole.permissionLevel}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No roles assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Assign New Role */}
            {showAssignRole && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assign New Role</CardTitle>
                  <CardDescription>
                    Assign roles and permission levels to this member
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="roleName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {loadingRoles ? (
                                    <div className="flex items-center justify-center p-4">
                                      <IconLoader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                  ) : (
                                    roles?.map((role) => (
                                      <SelectItem key={role.name} value={role.name}>
                                        {role.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="permissionLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permission Level</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select permission level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="unit">Unit</SelectItem>
                                  <SelectItem value="state">State</SelectItem>
                                  <SelectItem value="national">National</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Add Role
                      </Button>
                    </form>
                  </Form>

                  {/* Roles to be Assigned */}
                  {assignedRoles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Roles to be Assigned</h4>
                      {assignedRoles.map((role, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{role.roleName}</Badge>
                            <Badge className={getPermissionLevelColor(role.permissionLevel)}>
                              {role.permissionLevel}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRole(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Failed to load member details</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {showAssignRole && assignedRoles.length > 0 && (
            <Button
              onClick={handleAssignRoles}
              disabled={assignRoleMutation.isPending}
            >
              {assignRoleMutation.isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign ${assignedRoles.length} Role${assignedRoles.length !== 1 ? 's' : ''}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
