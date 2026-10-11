import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { Camera, Check, LoaderCircle, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { eventService } from '@/gateway/services'
import type { QrScanResult } from '@/gateway/types/api'

interface Props {
  eventId: string
  mode: 'attendance' | 'meal'
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanned: () => void
}

export function EventQrScannerDialog({ eventId, mode, open, onOpenChange, onScanned }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const cameraRequestIdRef = useRef(0)
  const processingRef = useRef(false)
  const submitTokenRef = useRef<(value: string) => Promise<void>>(async () => {})
  const [token, setToken] = useState('')
  const [result, setResult] = useState<QrScanResult | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [isStartingCamera, setIsStartingCamera] = useState(false)
  const [cameraStarted, setCameraStarted] = useState(false)

  const submitToken = async (value: string) => {
    const cleanToken = value.trim()
    if (!cleanToken || processingRef.current) return
    processingRef.current = true
    setIsSubmitting(true)
    setError('')
    try {
      const scanned = mode === 'attendance'
        ? await eventService.scanAttendanceQr(eventId, cleanToken)
        : await eventService.scanMealQr(eventId, cleanToken)
      setResult(scanned)
      onScanned()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The QR code could not be processed.'
      setError(message)
      processingRef.current = false
    } finally {
      setIsSubmitting(false)
    }
  }
  submitTokenRef.current = submitToken

  useEffect(() => {
    if (!open || result) return
    return () => {
      cameraRequestIdRef.current += 1
      controlsRef.current?.stop()
      controlsRef.current = null
      processingRef.current = false
    }
  }, [open, result])

  const startCamera = async () => {
    if (isStartingCamera || cameraStarted || result) return
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser cannot access the camera. Open the site over HTTPS and allow camera access in your browser settings.')
      return
    }
    if (!videoRef.current) {
      setCameraError('The camera preview is not ready yet. Close this window and try again.')
      return
    }

    const requestId = ++cameraRequestIdRef.current
    const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 200, delayBetweenScanSuccess: 500 })
    setIsStartingCamera(true)
    try {
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (decoded) => {
        if (!decoded || processingRef.current) return
        const scannedToken = decoded.getText()
        setToken(scannedToken)
        void submitTokenRef.current(scannedToken)
      })
      if (requestId !== cameraRequestIdRef.current) {
        controls.stop()
        return
      }
      controlsRef.current = controls
      setCameraStarted(true)
    } catch (cause) {
      if (requestId !== cameraRequestIdRef.current) return
      const name = cause instanceof Error ? cause.name : ''
      const message = name === 'NotAllowedError' || name === 'PermissionDeniedError'
        ? 'Camera permission was denied. Allow camera access for this site in your browser settings, then try again.'
        : name === 'NotFoundError' || name === 'DevicesNotFoundError'
          ? 'No camera was found on this device.'
          : name === 'NotReadableError' || name === 'TrackStartError'
            ? 'The camera is busy in another app. Close other apps using it and try again.'
            : `Could not start the camera${cause instanceof Error && cause.message ? `: ${cause.message}` : '.'}`
      setCameraError(message)
    } finally {
      if (requestId === cameraRequestIdRef.current) setIsStartingCamera(false)
    }
  }

  const reset = () => { setResult(null); setToken(''); setError(''); setCameraStarted(false); processingRef.current = false }
  const label = mode === 'attendance' ? 'Attendance check-in' : 'Meal collection'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>Scan a registered member&apos;s event tag. The result is submitted directly to the event service.</DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="space-y-4 rounded-xl border bg-emerald-50 p-5 text-emerald-950">
            <div className="flex items-center gap-3"><span className="rounded-full bg-emerald-600 p-2 text-white"><Check className="h-5 w-5" /></span><div><p className="font-semibold">Scan recorded</p><p className="text-sm text-emerald-800">{result.userName}</p></div></div>
            <div className="grid grid-cols-2 gap-3 text-sm"><p><span className="block text-emerald-700">Member number</span>{result.memberNo}</p><p><span className="block text-emerald-700">{result.mealName ? 'Meal' : 'Recorded at'}</span>{result.mealName || new Date(result.markedAt || result.collectedAt || '').toLocaleTimeString()}</p></div>
            <Button variant="outline" className="w-full" onClick={reset}>Scan next member</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-950">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
              <div className="pointer-events-none absolute inset-[18%] rounded-xl border-2 border-lime-300 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 text-sm text-white"><Camera className="h-4 w-4" /> Center the QR code in the frame</div>
              {!cameraStarted && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 p-5 text-center text-white">
                <Camera className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-300">Start the camera to scan an event tag.</p>
                <Button type="button" onClick={() => void startCamera()} disabled={isStartingCamera}>
                  {isStartingCamera ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                  {isStartingCamera ? 'Opening camera…' : 'Start camera'}
                </Button>
              </div>}
            </div>
            {cameraError && <p className="text-sm text-muted-foreground">{cameraError}</p>}
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void submitToken(token) }}>
              <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Or paste the QR token" aria-label="QR token" />
              <Button type="submit" disabled={!token.trim() || isSubmitting}>{isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Submit</Button>
            </form>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
