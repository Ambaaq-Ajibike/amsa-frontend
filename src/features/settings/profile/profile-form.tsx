"use client"

import { useEffect, useMemo } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { IconLoader2 } from "@tabler/icons-react"
import { userService, utilityService } from "@/gateway/services"
import { UpdateUserProfileRequest, UserProfile } from "@/gateway/types/api"
import { showSuccessToast, showErrorToast } from "@/utils/error-handler"

// Backend response type that matches the actual API response
interface BackendUserProfile {
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
  level?: string
  courseField?: string
  cgpa?: number
  graduationYear?: number
  exchangeProgramInterest?: boolean
  userRoles: Array<{
    roleId: string
    role: {
      name: string
    }
    permissionLevel: string
  }>
}



const profileFormSchema = z.object({
  memberNumber: z.string().min(2).max(30),
  firstName: z.string().min(2).max(30),
  lastName: z.string().min(2).max(30),
  email: z.string().email(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, { message: "Invalid phone number format" }),
  dob: z.date({ required_error: "A date of birth is required." }),
  unit: z.string({ required_error: "Please select a unit." }),
  level: z.string(),
  courseField: z.string().optional(),
  exchangeProgramInterest: z.boolean().optional(),
  cgpa: z.number().min(0).max(5).optional(),
  graduationYear: z.number().min(2000).max(2100).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const queryClient = useQueryClient()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      memberNumber: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dob: undefined,
      unit: "",
      level: "none",
      courseField: "",
      exchangeProgramInterest: false,
      cgpa: undefined,
      graduationYear: undefined,
    },
  })
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => userService.getProfile(),
  })

  const {
    data: units = [],
    isLoading: loadingUnits,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await utilityService.getUnits()
      return res.map((u) => ({ label: u.name, value: u.code }))
    },
  })

  const watchedUnit = form.watch("unit")

  // Ensure current/profile unit is always in the list so Radix Select can display it (fixes "Select a unit" placeholder)
  const effectiveUnits = useMemo(() => {
    const raws = new Set<string>()
    const profileRaw = (profile as unknown as Record<string, unknown>)?.unit as string | undefined
    if (profileRaw?.toString().trim()) raws.add(profileRaw.toString().trim())
    if (watchedUnit?.toString().trim()) raws.add(watchedUnit.toString().trim())
    if (raws.size === 0) return units
    if (units.length === 0) return Array.from(raws).map((r) => ({ label: r, value: r }))
    let result = [...units]
    for (const raw of raws) {
      const exists =
        result.some((u) => u.value === raw) ||
        result.some((u) => u.label === raw) ||
        result.some((u) => u.value.toLowerCase() === raw.toLowerCase()) ||
        result.some((u) => u.label.toLowerCase() === raw.toLowerCase())
      if (!exists) result = [...result, { label: raw, value: raw }]
    }
    return result
  }, [units, profile, watchedUnit])

  const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (profileData: ProfileFormValues) => {
      if (!profile?.id) {
        throw new Error("User profile is missing an id.")
      }

      const payload: UpdateUserProfileRequest = {
        userId: profile.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phoneNumber,
        unit: profileData.unit || profile.unit || "",
        state: profile.state || "",
        dob: profileData.dob.toISOString(),
        level: profileData.level === "none" ? "" : profileData.level || "",
        cgpa: profileData.cgpa,
        courseField: profileData.courseField,
        exchangeProgramInterest: profileData.exchangeProgramInterest,
        graduationYear: profileData.graduationYear,
      }

      return userService.updateProfile(profile.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] })
      showSuccessToast("Profile updated successfully")
    },
    onError: (error) => {
      showErrorToast("Failed to update profile")
      console.error(error)
    },
  })

  useEffect(() => {
    if (profile) {
      const backendData = profile as unknown as BackendUserProfile
      const rawProfile = profile as unknown as Record<string, unknown>
      const backendUnitRaw = (backendData.unit || (rawProfile.unit as string) || "").toString().trim()
      const backendLevelRaw = (backendData.level ?? (rawProfile.level as string) ?? "") as string
      const backendLevel = backendLevelRaw && backendLevelRaw.toString().trim() !== "" ? backendLevelRaw.toString() : "none"

      form.reset({
        memberNumber: backendData.memberNo || "",
        firstName: backendData.firstName || "",
        lastName: backendData.lastName || "",
        email: backendData.email || "",
        phoneNumber: backendData.phone || "",
        dob: backendData.dob ? new Date(backendData.dob) : undefined,
        unit: backendUnitRaw,
        level: backendLevel,
        courseField: (backendData.courseField || (rawProfile.courseField as string) || "") as string,
        exchangeProgramInterest: (backendData.exchangeProgramInterest ?? (rawProfile.exchangeProgramInterest as boolean) ?? false) as boolean,
        cgpa: (backendData.cgpa ?? (rawProfile.cgpa as number) ?? undefined) as number | undefined,
        graduationYear: (backendData.graduationYear ?? (rawProfile.graduationYear as number) ?? undefined) as number | undefined,
      })
    }
  }, [profile, form])

  // After units load, ensure the saved unit is mapped to a valid select value (code) so it displays
  useEffect(() => {
    if (!profile || units.length === 0) return
    const backendData = profile as unknown as BackendUserProfile
    const rawProfile = profile as unknown as Record<string, unknown>
    const backendUnitRaw = (backendData.unit || (rawProfile.unit as string) || "").toString().trim()
    if (!backendUnitRaw) return

    const currentUnit = form.getValues("unit")
    // If current value already corresponds to a valid item value, nothing to do
    if (units.some((u) => u.value === currentUnit)) return

    let resolved = backendUnitRaw
    const byValue = units.find((u) => u.value === backendUnitRaw)
    if (byValue) resolved = byValue.value
    else {
      const byLabel = units.find((u) => u.label === backendUnitRaw)
      if (byLabel) resolved = byLabel.value
      else {
        const lower = backendUnitRaw.toLowerCase()
        const byValueCI = units.find((u) => u.value.toLowerCase() === lower)
        if (byValueCI) resolved = byValueCI.value
        else {
          const byLabelCI = units.find((u) => u.label.toLowerCase() === lower)
          if (byLabelCI) resolved = byLabelCI.value
        }
      }
    }

    if (resolved !== currentUnit) {
      form.setValue("unit", resolved, { shouldValidate: true })
    }
  }, [profile, units, form])

  if (isLoading) return <div className='flex flex-1 min-h-[40vh] items-center justify-center'>
    <IconLoader2 className='size-8 animate-spin' />
  </div>
  if (error) return <p>Failed to load user</p>


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await updateProfile(data)
          } catch (err) {
            console.error('Profile update error:', err)
          }
        })}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='memberNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member Number</FormLabel>
              <FormControl>
                <Input placeholder='222222' {...field} readOnly disabled/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input placeholder='Ahmad' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input placeholder='Ahmad' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='ahmad@yahoo.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phoneNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input placeholder='+23480000000' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl className="w-full">
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'MMM d, yyyy')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <EnhancedDatePicker
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date: Date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    enableYearMonthDropdowns={true}
                    yearRange={{ from: 1900, to: new Date().getFullYear() }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full min-w-0">
              <FormLabel>Unit</FormLabel>
              {/* key forces Radix to remount when saved value / list changes so placeholder doesn't stick */}
              <Select
                key={`${field.value}-${effectiveUnits.length}-${loadingUnits ? "loading" : "ready"}`}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUnits ? "Loading units..." : "Select a unit"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {loadingUnits ? (
                    <SelectItem disabled value="loading" className="h-14">
                      <div className="flex items-center justify-center gap-2">
                        <IconLoader2 className="h-5 w-5 animate-spin" />
                        Loading...
                      </div>
                    </SelectItem>
                  ) : (
                    effectiveUnits.map(({ label, value }) => (
                      <SelectItem key={value} value={value} className="break-words">
                        {label}
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
          name='level'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No level selected</SelectItem>
                  <SelectItem value="Year 1">Year 1</SelectItem>
                  <SelectItem value="Year 2">Year 2</SelectItem>
                  <SelectItem value="Year 3">Year 3</SelectItem>
                  <SelectItem value="Year 4">Year 4</SelectItem>
                  <SelectItem value="Year 5">Year 5</SelectItem>
                  <SelectItem value="Year 6">Year 6</SelectItem>
                  <SelectItem value="Year 7">Year 7</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='courseField'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course/Career Field</FormLabel>
              <FormControl>
                <Input placeholder='Medicine, Engineering, etc.' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='cgpa'
          render={({ field }) => (
            <FormItem>
              <FormLabel>CGPA</FormLabel>
              <FormControl>
                <Input 
                  placeholder='0.00' 
                  type='number'
                  step='0.01'
                  min='0'
                  max='5'
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='graduationYear'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Graduation Year</FormLabel>
              <FormControl>
                <Input 
                  placeholder={new Date().getFullYear().toString()} 
                  type='number'
                  min='2000'
                  max='2100'
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='exchangeProgramInterest'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className='cursor-pointer'>
                Interested in Exchange Program
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update profile'}
        </Button>
      </form>
    </Form>
  )
}
