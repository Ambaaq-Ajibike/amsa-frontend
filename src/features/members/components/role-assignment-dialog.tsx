"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconLoader, IconShield } from "@tabler/icons-react"
import { userService, roleService, utilityService } from "@/gateway/services"
import { User } from "@/gateway/types/api"

const roleAssignmentSchema = z.object({
  rolePermissions: z.array(z.object({
    roleName: z.string(),
    permissionLevel: z.enum(['unit', 'state', 'national']),
  })).min(1, "At least one role must be selected"),
})

type RoleAssignmentFormValues = z.infer<typeof roleAssignmentSchema>

interface RoleAssignmentDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoleAssignmentDialog({ user, open, onOpenChange }: RoleAssignmentDialogProps) {
  const queryClient = useQueryClient()
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})

  const form = useForm<RoleAssignmentFormValues>({
    resolver: zodResolver(roleAssignmentSchema),
    defaultValues: {
      rolePermissions: [],
    },
  })

  // Fetch available roles
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAllRoles(),
  })

  // Fetch permission levels
  const { data: permissionLevels = [] } = useQuery({
    queryKey: ['permission-levels'],
    queryFn: () => utilityService.getAssignablePermissionLevels(),
  })

  const { mutateAsync: assignRole, isPending } = useMutation({
    mutationFn: userService.assignUserRole,
    onSuccess: () => {
      toast.success("User roles updated successfully!")
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onOpenChange(false)
      form.reset()
      setSelectedRoles({})
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user roles")
    },
  })

  // Initialize form with user's current roles
  useEffect(() => {
    if (user && open) {
      const currentRoles = user.roles.map(role => ({
        roleName: role,
        permissionLevel: 'unit' as const, // Default permission level
      }))
      form.setValue('rolePermissions', currentRoles)
      
      // Initialize selected roles
      const initialRoles: Record<string, string> = {}
      user.roles.forEach(role => {
        initialRoles[role] = 'unit'
      })
      setSelectedRoles(initialRoles)
    }
  }, [user, open, form])

  const handleRoleToggle = (roleName: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => ({ ...prev, [roleName]: 'unit' }))
    } else {
      setSelectedRoles(prev => {
        const newRoles = { ...prev }
        delete newRoles[roleName]
        return newRoles
      })
    }
  }

  const handlePermissionLevelChange = (roleName: string, level: string) => {
    setSelectedRoles(prev => ({ ...prev, [roleName]: level }))
  }

  const onSubmit = async (_values: RoleAssignmentFormValues) => {
    if (!user) return

    const rolePermissions = Object.entries(selectedRoles).map(([roleName, permissionLevel]) => ({
      roleName,
      permissionLevel: permissionLevel as 'unit' | 'state' | 'national',
    }))

    await assignRole({
      userId: user.id,
      rolePermissions,
    })
  }

  if (!user) return null

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Roles</DialogTitle>
          <DialogDescription>
            Manage roles and permissions for this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Member No: {user.memberNo}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{user.unit}</Badge>
                <Badge variant="outline">{user.state}</Badge>
              </div>
            </div>
          </div>

          {/* Current Roles */}
          {user.roles.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Current Roles</h4>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    <IconShield className="h-3 w-3 mr-1" />
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Role Selection */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Available Roles</h4>
                {loadingRoles ? (
                  <div className="flex items-center justify-center py-4">
                    <IconLoader className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div key={role.id} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={role.id}
                            checked={selectedRoles.hasOwnProperty(role.name)}
                            onCheckedChange={(checked) => 
                              handleRoleToggle(role.name, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={role.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {role.name}
                            </label>
                            {role.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {selectedRoles.hasOwnProperty(role.name) && (
                          <div className="mt-3 ml-6">
                            <label className="text-xs font-medium text-muted-foreground">
                              Permission Level
                            </label>
                            <div className="flex gap-2 mt-1">
                              {permissionLevels.map((level) => (
                                <Button
                                  key={level.value}
                                  type="button"
                                  variant={selectedRoles[role.name] === level.value ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePermissionLevelChange(role.name, level.value)}
                                  className="text-xs"
                                >
                                  {level.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || Object.keys(selectedRoles).length === 0}>
                  {isPending ? (
                    <>
                      <IconLoader className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Roles'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
