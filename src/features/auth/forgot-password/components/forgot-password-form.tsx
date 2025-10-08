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
import { IconLoader, IconMail } from "@tabler/icons-react"
import { toast } from "sonner"
import { authService } from "@/gateway/services"

interface ForgotPasswordFormProps extends HTMLAttributes<HTMLFormElement> {
  onSuccess?: () => void
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export function ForgotPasswordForm({ className, onSuccess, ...props }: ForgotPasswordFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const { mutateAsync: forgotPasswordMutation, isPending } = useMutation({
    mutationFn: authService.forgotPassword,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await forgotPasswordMutation(values)
      toast.success("Password reset instructions sent to your email")
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Failed to send reset instructions")
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
          <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="your.email@example.com" 
                    className="pl-10"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-2" disabled={isPending}>
          {isPending ? <IconLoader className="h-4 w-4 animate-spin" /> : "Send Reset Instructions"}
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