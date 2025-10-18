'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { roleService, userService, utilityService } from '@/gateway/services'
import { IconLoader2 } from '@tabler/icons-react'
import { User } from '../data/schema'
import type { RoleAndPermission } from '@/gateway/types/api'

const assignRoleSchema = z.object({
  roleName: z.string().min(1, 'Please select a role'),
  permissionLevel: z.enum(['unit', 'state', 'national']),
})

type AssignRoleFormData = z.infer<typeof assignRoleSchema>

interface UsersAssignRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersAssignRoleDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersAssignRoleDialogProps) {
  const [assignedRoles, setAssignedRoles] = useState<RoleAndPermission[]>([])
  const queryClient = useQueryClient()

  const form = useForm<AssignRoleFormData>({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: {
      roleName: '',
      permissionLevel: 'unit' as const,
    },
  })

  // Fetch available roles
  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAllRoles(),
  })

  // Fetch assignable permission levels
  const { data: assignableLevels, isLoading: loadingPermissionLevels } = useQuery({
    queryKey: ['assignable-permission-levels'],
    queryFn: () => utilityService.getAssignablePermissionLevels(),
  })

  // Set default permission level when data is loaded
  useEffect(() => {
    if (assignableLevels && assignableLevels.length > 0 && !form.getValues('permissionLevel')) {
      form.setValue('permissionLevel', assignableLevels[0].value as 'unit' | 'state' | 'national')
    }
  }, [assignableLevels, form])

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: (data: { userId: string; rolePermissions: RoleAndPermission[] }) =>
      userService.assignUserRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      onOpenChange(false)
      setAssignedRoles([])
      form.reset()
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Role to {currentRow.firstName} {currentRow.lastName}</DialogTitle>
          <DialogDescription>
            Assign roles and permission levels to this member. You can assign multiple roles at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Roles */}
          <div>
            <h4 className="text-sm font-medium mb-2">Current Roles</h4>
            <div className="flex flex-wrap gap-2">
              {(currentRow.roles || []).length > 0 ? (
                (currentRow.roles || []).map((role, index) => (
                  <Badge key={index} variant="outline">
                    {role}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  No roles assigned
                </Badge>
              )}
            </div>
          </div>

          {/* Add New Role Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        {loadingPermissionLevels ? (
                          <div className="flex items-center justify-center p-4">
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          assignableLevels?.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Add Role
              </Button>
            </form>
          </Form>

          {/* Roles to be Assigned */}
          {assignedRoles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Roles to be Assigned</h4>
              <div className="space-y-2">
                {assignedRoles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <Badge variant="outline" className="mr-2">
                        {role.roleName}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({role.permissionLevel})
                      </span>
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
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignRoles}
            disabled={assignedRoles.length === 0 || assignRoleMutation.isPending}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
