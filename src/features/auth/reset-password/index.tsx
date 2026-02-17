import { useLocation } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export default function ResetPassword() {
  const location = useLocation()
  const memberNo = new URLSearchParams(location.search).get('memberNo') || undefined
  const token = new URLSearchParams(location.search).get('token') || undefined

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Reset Password
          </CardTitle>
          <CardDescription>
            Set a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm memberNo={memberNo} token={token} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
