import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useQuery } from '@tanstack/react-query'
import { Download, LoaderCircle, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { eventService } from '@/gateway/services'
import type { Event } from '@/gateway/types/api'
import { useAuthStore } from '@/stores/authStore'

interface EventAttendeeTagProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventAttendeeTag({ event, open, onOpenChange }: EventAttendeeTagProps) {
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
      width: 360,
      color: { dark: '#10251e', light: '#ffffff' },
    }).then((image) => active && setQrImage(image)).catch(() => active && setQrImage(''))
    return () => { active = false }
  }, [data?.token])

  const downloadTag = () => {
    if (!qrImage) return
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1500
    const context = canvas.getContext('2d')
    if (!context) return
    context.fillStyle = '#f4f7f2'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#123c2c'
    context.fillRect(0, 0, canvas.width, 350)
    context.fillStyle = '#d9f99d'
    context.font = 'bold 44px Arial'
    context.fillText('AMSA NIGERIA', 80, 105)
    context.fillStyle = '#ffffff'
    context.font = 'bold 66px Arial'
    context.fillText('EVENT ACCESS', 80, 230)
    context.font = '32px Arial'
    context.fillText(event.title.slice(0, 30), 80, 295)
    context.fillStyle = '#10251e'
    context.font = 'bold 68px Arial'
    context.fillText(user?.name || 'AMSA Member', 80, 500, 1040)
    context.fillStyle = '#52645a'
    context.font = '38px Arial'
    context.fillText(`UNIT  ·  ${user?.unit || 'AMSA'}`, 80, 580, 1040)
    const qr = new Image()
    qr.onload = () => {
      context.fillStyle = '#ffffff'
      context.fillRect(330, 660, 540, 540)
      context.drawImage(qr, 350, 680, 500, 500)
      context.fillStyle = '#52645a'
      context.font = '30px Arial'
      context.textAlign = 'center'
      context.fillText('Present this code for event check-in and meals', 600, 1300)
      const link = document.createElement('a')
      link.download = `amsa-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-event-tag.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    qr.src = qrImage
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-0 bg-[#f4f7f2] p-0">
        <div className="bg-[#123c2c] px-6 py-7 text-white">
          <p className="text-xs font-semibold tracking-[0.24em] text-lime-200">AMSA NIGERIA</p>
          <DialogHeader className="mt-4 text-left">
            <DialogTitle className="text-2xl text-white">Your event tag</DialogTitle>
            <DialogDescription className="text-white/75">Keep this tag ready for event check-in and meal collection.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-5 px-6 pb-6">
          <div>
            <p className="truncate text-xl font-bold text-[#10251e]">{user?.name || 'AMSA Member'}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{user?.unit || 'AMSA member'} · {event.title}</p>
          </div>
          <div className="mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
            {isLoading ? <LoaderCircle className="h-8 w-8 animate-spin text-primary" /> : qrImage ? <img src={qrImage} alt={`Event access QR code for ${event.title}`} className="h-full w-full" /> : <QrCode className="h-16 w-16 text-muted-foreground" />}
          </div>
          {isError && <p role="alert" className="text-center text-sm text-destructive">Could not load your event tag. Confirm that you are registered for this event and try again.</p>}
          <Button onClick={downloadTag} disabled={!qrImage} className="w-full">
            <Download className="mr-2 h-4 w-4" /> Download event tag
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
