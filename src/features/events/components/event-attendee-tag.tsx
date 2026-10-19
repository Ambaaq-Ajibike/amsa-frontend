import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { eventService } from '@/gateway/services'
import type { Event } from '@/gateway/types/api'
import { Download, LoaderCircle, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EventAttendeeTagProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
}

const eventDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image failed to load'))
    image.src = src
  })

export function EventAttendeeTag({
  event,
  open,
  onOpenChange,
}: EventAttendeeTagProps) {
  const user = useAuthStore((state) => state.auth.user)
  const [qrImage, setQrImage] = useState('')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['event-my-qr', event.id],
    queryFn: () => eventService.getMyQrToken(event.id),
    enabled: open,
    staleTime: 0,
  })

  useEffect(() => {
    let active = true
    if (!data?.token) {
      setQrImage('')
      return
    }
    QRCode.toDataURL(data.token, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 480,
      color: { dark: '#10251e', light: '#ffffff' },
    })
      .then((image) => active && setQrImage(image))
      .catch(() => active && setQrImage(''))
    return () => {
      active = false
    }
  }, [data?.token])

  const downloadTag = async () => {
    if (!qrImage) return
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1600
    const context = canvas.getContext('2d')
    if (!context) return

    const background = context.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    )
    background.addColorStop(0, '#075b39')
    background.addColorStop(0.48, '#087547')
    background.addColorStop(1, '#073b32')
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
    const glow = context.createRadialGradient(980, 190, 10, 980, 190, 650)
    glow.addColorStop(0, 'rgba(163, 230, 53, 0.36)')
    glow.addColorStop(1, 'rgba(163, 230, 53, 0)')
    context.fillStyle = glow
    context.fillRect(0, 0, canvas.width, canvas.height)
    const lowerGlow = context.createRadialGradient(
      100,
      1200,
      10,
      100,
      1200,
      650
    )
    lowerGlow.addColorStop(0, 'rgba(45, 212, 191, 0.22)')
    lowerGlow.addColorStop(1, 'rgba(45, 212, 191, 0)')
    context.fillStyle = lowerGlow
    context.fillRect(0, 0, canvas.width, canvas.height)

    let logo: HTMLImageElement
    let qr: HTMLImageElement
    try {
      ;[logo, qr] = await Promise.all([
        loadImage('/images/amsa-logo.jpg'),
        loadImage(qrImage),
      ])
    } catch {
      return
    }

    context.save()
    context.beginPath()
    context.arc(125, 112, 62, 0, Math.PI * 2)
    context.fillStyle = '#ffffff'
    context.fill()
    context.clip()
    context.drawImage(logo, 75, 62, 100, 100)
    context.restore()

    context.fillStyle = '#ecfccb'
    context.font = 'bold 26px Arial'
    context.fillText('AHMADI MUSLIM STUDENTS', 220, 100)
    context.fillText('ASSOCIATION · NIGERIA', 220, 138)
    context.fillStyle = 'rgba(255,255,255,0.72)'
    context.font = '22px Arial'
    context.fillText('OFFICIAL EVENT ACCESS TAG', 220, 178)

    context.strokeStyle = 'rgba(255,255,255,0.72)'
    context.lineWidth = 2
    context.strokeRect(90, 260, 1020, 170)
    context.fillStyle = '#ffffff'
    context.font = 'bold 56px Arial'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(event.title.toUpperCase(), 600, 345, 940)

    context.fillStyle = 'rgba(236,252,203,0.78)'
    context.font = 'bold 23px Arial'
    context.fillText('REGISTERED PARTICIPANT', 600, 525)
    context.fillStyle = '#ffffff'
    context.font = 'bold 68px Arial'
    context.fillText(user?.name || 'AMSA Member', 600, 625, 1020)
    context.fillStyle = '#d1fae5'
    context.font = '32px Arial'
    context.fillText(
      (user?.unit || 'AMSA MEMBER').toUpperCase(),
      600,
      690,
      1000
    )

    context.fillStyle = '#ffffff'
    context.fillRect(300, 760, 600, 86)
    context.fillStyle = '#064e3b'
    context.font = 'bold 38px Arial'
    context.fillText('PARTICIPANT', 600, 804)

    context.fillStyle = '#ffffff'
    context.fillRect(260, 900, 680, 590)
    context.drawImage(qr, 325, 920, 550, 550)
    context.fillStyle = '#dcfce7'
    context.font = '24px Arial'
    context.fillText('SCAN FOR EVENT CHECK-IN & MEALS', 600, 1535)
    const date = eventDate(event.startDate)
    if (date) {
      context.fillStyle = 'rgba(255,255,255,0.78)'
      context.font = '22px Arial'
      context.fillText(date, 600, 1573)
    }

    const dataUrl = canvas.toDataURL('image/png')
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (isIOS) {
      // iOS Safari can't trigger canvas downloads — open image in new tab so user can save it
      window.open(dataUrl, '_blank')
      return
    }
    const link = document.createElement('a')
    link.download = `amsa-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-event-tag.png`
    link.href = dataUrl
    link.click()
  }

  const name = user?.name || 'AMSA Member'
  const unit = user?.unit || 'AMSA Member'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[94dvh] max-w-md overflow-y-auto border-0 bg-transparent p-0 text-white shadow-none'>
        <DialogHeader className='sr-only'>
          <DialogTitle>Your event participant tag</DialogTitle>
          <DialogDescription>
            Show this tag to scan your event attendance or meal access.
          </DialogDescription>
        </DialogHeader>
        <div className='relative isolate mx-auto w-full overflow-hidden rounded-[1.75rem] bg-[radial-gradient(ellipse_at_88%_8%,rgba(190,242,100,0.45),transparent_35%),radial-gradient(ellipse_at_8%_76%,rgba(45,212,191,0.28),transparent_38%),linear-gradient(145deg,#075b39_0%,#087547_48%,#073b32_100%)] px-6 pt-5 pb-6 text-white shadow-2xl sm:px-8'>
          <div
            aria-hidden
            className='pointer-events-none absolute top-48 -right-20 -z-10 size-64 rounded-full border border-white/10'
          />
          <div
            aria-hidden
            className='pointer-events-none absolute top-58 -right-10 -z-10 size-44 rounded-full border border-lime-100/10'
          />

          <div className='flex items-center gap-3'>
            <div className='grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white/70 bg-white shadow-md'>
              <img
                src='/images/amsa-logo.jpg'
                alt='AMSA logo'
                className='size-full object-cover'
              />
            </div>
            <div className='min-w-0'>
              <p className='text-[10px] font-bold tracking-[0.16em] text-lime-100 uppercase sm:text-xs'>
                Ahmadi Muslim Students’ Association
              </p>
              <p className='mt-1 text-[10px] font-medium tracking-[0.26em] text-white/70 uppercase'>
                Nigeria · Official event tag
              </p>
            </div>
          </div>

          <div className='relative mt-6 border border-white/60 px-4 py-3 text-center sm:mt-7 sm:py-4'>
            <span
              aria-hidden
              className='absolute -top-1.5 -left-1.5 size-3 bg-white'
            />
            <span
              aria-hidden
              className='absolute -top-1.5 -right-1.5 size-3 bg-white'
            />
            <span
              aria-hidden
              className='absolute -bottom-1.5 -left-1.5 size-3 bg-white'
            />
            <span
              aria-hidden
              className='absolute -right-1.5 -bottom-1.5 size-3 bg-white'
            />
            <p className='text-base leading-tight font-black tracking-wide uppercase sm:text-xl'>
              {event.title}
            </p>
          </div>

          <div className='mt-6 text-center sm:mt-7'>
            <p className='text-[10px] font-bold tracking-[0.28em] text-lime-100/80 uppercase'>
              Registered participant
            </p>
            <p className='mt-2 text-2xl leading-tight font-black tracking-tight break-words sm:text-3xl'>
              {name}
            </p>
            <p className='mt-2 text-xs font-semibold tracking-[0.2em] text-emerald-50/80 uppercase'>
              {unit}
            </p>
          </div>

          <div className='mx-auto mt-5 w-fit bg-white px-7 py-2 text-sm font-black tracking-[0.2em] text-emerald-950 shadow-sm sm:mt-6'>
            PARTICIPANT
          </div>

          <div className='mx-auto mt-5 grid size-[min(68vw,17rem)] max-h-[34vh] max-w-full place-items-center rounded-2xl bg-white p-3 shadow-[0_16px_45px_rgba(0,0,0,0.24)] sm:mt-6 sm:size-64 sm:max-h-none sm:p-4'>
            {isLoading ? (
              <LoaderCircle className='size-9 animate-spin text-emerald-800' />
            ) : qrImage ? (
              <img
                src={qrImage}
                alt={`Event access QR code for ${event.title}`}
                className='size-full object-contain'
              />
            ) : (
              <QrCode className='size-16 text-emerald-900' />
            )}
          </div>

          <div className='mt-4 text-center'>
            <p className='text-[10px] font-bold tracking-[0.18em] text-lime-50 uppercase sm:text-xs'>
              Scan for event check-in and meals
            </p>
            <p className='mt-1 text-[10px] text-white/70'>
              {eventDate(event.startDate)}
            </p>
          </div>

          {isError && (
            <p
              role='alert'
              className='text-destructive mt-4 rounded-lg bg-white/95 p-3 text-center text-sm'
            >
              Could not load your event tag. Confirm that you are registered for
              this event and try again.
            </p>
          )}
          <Button
            onClick={() => void downloadTag()}
            disabled={!qrImage}
            className='mt-5 w-full bg-white font-semibold text-emerald-950 hover:bg-emerald-50'
          >
            <Download className='mr-2 size-4' /> Download event tag
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
