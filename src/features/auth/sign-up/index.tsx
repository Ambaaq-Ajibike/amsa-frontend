import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { SignUpForm } from './components/sign-up-form'
import AmsaLogo from '@/assets/amsa-logo.jpg'

export default function SignIn() {
  return (
    <div className='relative container flex min-h-svh flex-col items-center justify-center lg:max-w-none lg:grid lg:grid-cols-2 lg:px-0'>
      {/* Left section */}
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-zinc-900' />
        <div className='relative z-20 flex text-2xl font-medium'>
          AMSA Nigeria
        </div>

        <img
          src={AmsaLogo}
          className='relative m-auto rounded-full'
          width={301}
          height={60}
          alt='Vite'
        />
      </div>

      {/* Mobile header (logo + text beside each other) */}
      <div className='flex items-center justify-center gap-3 py-6 lg:hidden'>
        <img
          src={AmsaLogo}
          className='w-12 h-12 rounded-full'
          alt='AMSA Nigeria'
        />
        <span className='text-xl font-semibold'>AMSA Nigeria</span>
      </div>

      {/* Form */}
      <div className="mx-auto w-full sm:w-[500px]">
        <Card>
          <CardContent>
            <SignUpForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
