"use client"

import { HTMLAttributes, useEffect, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { PasswordInput } from "@/components/password-input"
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, ChevronLeftIcon } from "@radix-ui/react-icons"
import { UserResponse } from "@/gateway/types/user"
import { userService, utilityService } from "@/gateway/services"
import { Link, useNavigate } from "@tanstack/react-router"
import { SelectDropdown } from "@/components/select-dropdown"
import { useQuery, useMutation } from "@tanstack/react-query"
import { IconLoader } from "@tabler/icons-react"
import { toast } from "sonner"

interface SignUpFormProps extends HTMLAttributes<HTMLFormElement> {
  onSuccess?: () => void
}

// ✅ Schema
const formSchema = z.object({
  memberNo: z.string().min(2, { message: "Member number required" }),
  password: z.string().min(7, { message: "Password must be at least 7 characters" }),
  firstName: z.string().min(1, { message: "First name required" }),
  lastName: z.string().min(1, { message: "Last name required" }),
  email: z.string().email({ message: "Invalid email address" }),
  unit: z.string().min(1, { message: "Unit required" }),
  phone: z.string().min(7, { message: "Phone required" }),
  level: z.string().min(1, { message: "Level required" }),
  dob: z.date({ required_error: "Date of birth required" }),
})

type FormValues = z.infer<typeof formSchema>

// ✅ API helpers
async function getUserByChandaNumber(chandaNumber: string): Promise<UserResponse> {
  return userService.getUserByMemberNo(chandaNumber)
}

async function getUnits() {
  const res = await utilityService.getUnits()
  return res.map((u) => ({ label: u.name, value: u.code }))
}

async function createUser(data: FormValues) {
  const payload = {
    memberNo: data.memberNo,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    unit: data.unit,
    phone: data.phone,
    level: data.level,
    dob: data.dob.toISOString(),
  }
  return userService.createUser(payload)
}

export function SignUpForm({ className, onSuccess, ...props }: SignUpFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberNo: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      unit: "",
      phone: "",
      level: "Year 1",
      dob: undefined,
    },
  })

  // ✅ Units query
  const {
    data: units = [],
    isLoading: loadingUnits,
  } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  })

  // ✅ Fetch user by memberNo (disabled by default, run manually)
  const {
    refetch: fetchUser,
    isFetching: isFetchingUser,
  } = useQuery({
    queryKey: ["user", form.watch("memberNo")],
    queryFn: () => getUserByChandaNumber(form.watch("memberNo")),
    enabled: false,
  })

  // Watch memberNo for debounced lookup
  const memberNo = form.watch("memberNo")

  // Debounce effect for memberNo lookup
  useEffect(() => {
    if (!memberNo || memberNo.length < 3) return

    const handler = setTimeout(() => {
      fetchUser()
        .then(({ data: user }) => {
          if (user) {
            form.reset({
              memberNo,
              password: "",
              firstName: user.firstName || "",
              lastName: user.surname || "",
              email: user.email || "",
              phone: user.phoneNo || "",
              unit: "",
              level: "Year 1",
              dob: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
            })
          }
        })
        .catch(() => { })
    }, 1000)

    return () => clearTimeout(handler)
  }, [memberNo, fetchUser, form])

  const { mutateAsync: createUserMutation, isPending: isCreating } = useMutation({
    mutationFn: createUser,
  })

  // Handle next step - validate member number
  async function handleNext() {
    const memberNo = form.getValues("memberNo")
    if (!memberNo || memberNo.length < 2) {
      form.setError("memberNo", { message: "Member number is required" })
      return
    }

    // Try to fetch user data
    try {
      const { data: user } = await fetchUser()
      if (user) {
        // Pre-fill form with user data
        form.setValue("firstName", user.firstName || "")
        form.setValue("lastName", user.surname || "")
        form.setValue("email", user.email || "")
        form.setValue("phone", user.phoneNo || "")
        form.setValue("level", "")
        if (user.dateOfBirth) {
          form.setValue("dob", new Date(user.dateOfBirth))
        }
      }
    } catch (_error) {
      // User not found, continue to next step
    }
    
    setCurrentStep(2)
  }

  // Handle back to previous step
  function handleBack() {
    setCurrentStep(1)
  }

  async function onSubmit(values: FormValues) {
    try {
      await createUserMutation(values)
      toast.success("User created successfully")
      form.reset()
      setCurrentStep(1)
      // Redirect to sign-in page after successful account creation
      navigate({ to: "/sign-in" })
      if (onSuccess) onSuccess()
    } catch (_err) {
      toast.error("Failed to create user")
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-3", className)}
        {...props}
      >
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="text-2xl font-semibold">Create an Account</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              1
            </div>
            <div className={cn(
              "w-16 h-1 rounded",
              currentStep >= 2 ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Member Number */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Enter Your Member Number</h3>
              <p className="text-sm text-muted-foreground">
                Please enter your member number to continue
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="memberNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member Number</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="button" 
              onClick={handleNext}
              disabled={isFetchingUser}
              className="w-full mt-4"
            >
              {isFetchingUser ? (
                <>
                  <IconLoader className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Complete Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                Fill in your personal details to create your account
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+2348012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
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
              name="unit"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full min-w-0">
                  <FormLabel>Units</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    items={units}
                    placeholder={loadingUnits ? "Loading units..." : "Select a unit"}
                    className="w-full"
                    isControlled
                    isPending={loadingUnits}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <EnhancedDatePicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? <IconLoader className="w-4 h-4 mr-2" /> : null}
                Create Account
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
