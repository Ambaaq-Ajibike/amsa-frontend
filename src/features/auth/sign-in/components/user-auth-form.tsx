"use client"

import { HTMLAttributes } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
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
import { PasswordInput } from "@/components/password-input"
import { IconLoader } from "@tabler/icons-react"
import { showSuccessToast, showErrorToast } from "@/utils/error-handler"
import { authService } from "@/gateway/services"
import { useAuthStore } from "@/stores/authStore"
import { getRedirectPath } from "@/utils/redirect-utils"

type UserAuthFormProps = HTMLAttributes<HTMLFormElement> & {
  onSuccess?: () => void
}

const formSchema = z.object({
  memberNo: z.string().min(1, { message: "Please enter your email address" }),
  password: z.string().min(1, { message: "Please enter your password" }),
})

// API call
async function login(data: z.infer<typeof formSchema>) {
  return authService.login(data)
}

export function UserAuthForm({ className, onSuccess, ...props }: UserAuthFormProps) {
  const { setAccessToken, setUser } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberNo: "",
      password: "",
    },
  })

  const { mutateAsync: loginMutation, isPending } = useMutation({
    mutationFn: login,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await loginMutation(values)

      // Update auth store
      setAccessToken(res.accessToken)
      setUser({
        name: res.name,
        chandaNo: res.chandaNo,
        unit: res.unit,
        permissions: res.permissions,
        roles: res.roles,
        accessToken: res.accessToken,
        expiresIn: res.expiresIn,
        tokenType: res.tokenType,
        scope: res.scope,
        refreshToken: res.refreshToken
      })

      // Save additional tokens in localStorage
      localStorage.setItem("refreshToken", res.refreshToken)
      localStorage.setItem("tokenType", res.tokenType)
      localStorage.setItem("expiresIn", res.expiresIn.toString())
      localStorage.setItem("scope", res.scope)

      showSuccessToast("Login successful")
      
      // Redirect based on user permissions and roles
      const redirectPath = getRedirectPath()
      navigate({ to: redirectPath })
      
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      showErrorToast(err)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-3", className)}
        {...props}
      >
        {/* Header */}
        <div className="flex flex-col space-y-2 text-left mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-muted-foreground text-sm">
            Enter your membership number and password to access your account.
          </p>
        </div>

        <FormField
          control={form.control}
          name="memberNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member Number</FormLabel>
              <FormControl>
                <Input placeholder="2222222" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forgot-password"
                className="text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75"
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />

        <Button className="mt-2" disabled={isPending}>
          {isPending ? <IconLoader className="h-4 w-4 animate-spin" /> : "Login"}
        </Button>

        {/* Footer link */}
        <p className="text-sm text-muted-foreground text-center mt-2">
          Don’t have an account?{" "}
          <Link
            to="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  )
}
