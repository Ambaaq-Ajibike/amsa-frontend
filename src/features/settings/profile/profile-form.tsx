"use client"

import { useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { showSubmittedData } from "@/utils/show-submitted-data"
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
import { IconLoader2 } from "@tabler/icons-react"
import { userService } from "@/gateway/services"
import { UserProfile } from "@/gateway/types/api"

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
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
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
    },
  })
  const { data, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => userService.getProfile(),
  })

  useEffect(() => {
    if (data) {
      const backendData = data as unknown as BackendUserProfile
      form.reset({
        memberNumber: backendData.memberNo || "",
        firstName: backendData.firstName || "",
        lastName: backendData.lastName || "",
        email: backendData.email || "",
        phoneNumber: backendData.phone || "",
        dob: backendData.dob ? new Date(backendData.dob) : undefined,
        unit: backendData.unit || "",
        level: "none", // No level field in backend response
      })
    }
  }, [data, form])

  if (isLoading) return <div className='flex h-svh items-center justify-center'>
    <IconLoader2 className='size-8 animate-spin' />
  </div>
  if (error) return <p>Failed to load user</p>


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((_data) => showSubmittedData("Profile updated successfully"))}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='memberNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member Number</FormLabel>
              <FormControl>
                <Input placeholder='222222' {...field} />
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
            <FormItem className="flex flex-col w-full">
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Unit" 
                  {...field} 
                  readOnly 
                  className="bg-muted cursor-not-allowed"
                />
              </FormControl>
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
        <Button type='submit'>Update profile</Button>
      </form>
    </Form>
  )
}
