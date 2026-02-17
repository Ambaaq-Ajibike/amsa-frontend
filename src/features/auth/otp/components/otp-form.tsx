"use client"

import { HTMLAttributes } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "@tanstack/react-router"
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
import { IconLoader, IconShield } from "@tabler/icons-react"
import { toast } from "sonner"
import { authService } from "@/gateway/services"

interface OtpFormProps extends HTMLAttributes<HTMLFormElement> {
  onSuccess?: () => void
  memberNo?: string
}

const formSchema = z.object({
  memberNo: z.string().min(1, { message: "Please enter your member number" }),
  token: z.string().min(6, { message: "Please enter the 6-digit code" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export function OtpForm({ className, onSuccess, memberNo, ...props }: OtpFormProps) {
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberNo: memberNo || "",
      token: "",
      password: "",
    },
  })

  const { mutateAsync: resetPasswordMutation, isPending } = useMutation({
    mutationFn: authService.resetPassword,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await resetPasswordMutation({
        memberNo: values.memberNo,
        token: values.token,
        password: values.password,
      })
      toast.success("Password reset successfully! You can now sign in with your new password.")
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to reset password")
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
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter the verification code sent to your email and your new password.
          </p>
        </div>

        <FormField
          control={form.control}
          name="memberNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconShield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="2222222" 
                    className="pl-10"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="123456" 
                  maxLength={6}
                  {...field} 
                />
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
                <Input 
                  type="password"
                  placeholder="Enter new password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-2" disabled={isPending}>
          {isPending ? <IconLoader className="h-4 w-4 animate-spin" /> : "Reset Password"}
        </Button>

        {/* Footer link */}
        <p className="text-sm text-muted-foreground text-center mt-2">
          Remember your password?{" "}
          <Link
            to="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}