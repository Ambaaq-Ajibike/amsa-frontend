import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/context/theme-context'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group [&_div[data-content]]:w-full'
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'hsl(142, 76%, 36%)',
          '--success-text': 'hsl(355, 7%, 97%)',
          '--error-bg': 'hsl(0, 84%, 60%)',
          '--error-text': 'hsl(355, 7%, 97%)',
          '--warning-bg': 'hsl(38, 92%, 50%)',
          '--warning-text': 'hsl(355, 7%, 97%)',
          '--info-bg': 'hsl(221, 83%, 53%)',
          '--info-text': 'hsl(355, 7%, 97%)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
