"use client"

import { HTMLAttributes, useEffect } from "react"
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
import { IconHash, IconLoader } from "@tabler/icons-react"
import { showErrorToast, showSuccessToast } from "@/utils/error-handler"
import { authService } from "@/gateway/services"

interface ResetPasswordFormProps extends HTMLAttributes<HTMLFormElement> {
  memberNo?: string
  token?: string
  onSuccess?: () => void
}

const formSchema = z
  .object({
    memberNo: z.string().min(1, { message: "Please enter your member number" }),
    token: z.string().min(1, { message: "Please enter your reset token" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export function ResetPasswordForm({
  className,
  memberNo,
  token,
  onSuccess,
  ...props
}: ResetPasswordFormProps) {
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberNo: memberNo ?? "",
      token: token ?? "",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (memberNo) form.setValue("memberNo", memberNo)
    if (token) form.setValue("token", token)
  }, [memberNo, token, form])

  const { mutateAsync: resetPasswordMutation, isPending } = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      showSuccessToast("Password reset successful. You can now sign in.")
      if (onSuccess) onSuccess()
      setTimeout(() => {
        navigate({ to: "/sign-in" })
      }, 1500)
    },
    onError: (error: unknown) => {
      console.error("Password reset failed:", error)
      showErrorToast(error)
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await resetPasswordMutation({
        memberNo: values.memberNo,
        token: decodeURIComponent(values.token),
        password: values.password,
      })
    } catch (err: unknown) {
      console.error("Error submitting form:", err)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-3", className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="memberNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconHash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="2222222" className="pl-10" disabled {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-2" disabled={isPending}>
          {isPending ? <IconLoader className="h-4 w-4 animate-spin" /> : "Reset Password"}
        </Button>

        <p className="text-sm text-muted-foreground text-center mt-2">
          Remember your password?{" "}
          <Link to="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}
