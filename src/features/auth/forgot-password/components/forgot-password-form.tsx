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
import { IconHash, IconLoader } from "@tabler/icons-react"
import { toast } from "sonner"
import { authService } from "@/gateway/services"

interface ForgotPasswordFormProps extends HTMLAttributes<HTMLFormElement> {
  onSuccess?: () => void
}

const formSchema = z.object({
  memberNo: z.string().min(1, { message: "Please enter your member number" }),
})

export function ForgotPasswordForm({ className, onSuccess, ...props }: ForgotPasswordFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberNo: "",
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

        <FormField
          control={form.control}
          name="memberNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconHash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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