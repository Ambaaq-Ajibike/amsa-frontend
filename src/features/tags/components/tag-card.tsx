import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { User } from '@/gateway/types/api'

interface TagCardProps {
  user: User
  qrToken?: string // when provided (event tags), encode this instead of memberNo
}

export function TagCard({ user, qrToken }: TagCardProps) {
  const [qrImage, setQrImage] = useState('')

  useEffect(() => {
    let active = true
    QRCode.toDataURL(qrToken ?? user.memberNo ?? user.id ?? 'AMSA', {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: { dark: '#10251e', light: '#ffffff' },
    })
      .then((url) => active && setQrImage(url))
      .catch(() => active && setQrImage(''))
    return () => {
      active = false
    }
  }, [qrToken, user.memberNo, user.id])

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'AMSA Member'
  const unit = user.unit || 'AMSA Nigeria'

  return (
    <div
      className='flex h-full w-full flex-col overflow-hidden rounded-lg shadow-md text-white'
      style={{
        background: 'linear-gradient(145deg, #075b39 0%, #087547 48%, #073b32 100%)',
      }}
    >
      {/* Header */}
      <div className='flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0'>
        <div className='size-6 shrink-0 rounded-full border border-white/70 bg-white overflow-hidden'>
          <img src='/images/amsa-logo.jpg' alt='AMSA' className='size-full object-cover' />
        </div>
        <div className='min-w-0'>
          <p className='text-[6px] font-bold text-lime-100 leading-tight truncate'>AMSA NIGERIA</p>
          <p className='text-[5px] text-white/60 leading-tight'>OFFICIAL MEMBER TAG</p>
        </div>
      </div>

      {/* Unit box */}
      <div className='mx-2 border border-white/60 px-1.5 py-1 text-center flex-shrink-0 relative'>
        <span className='absolute -top-0.5 -left-0.5 size-1.5 bg-white' />
        <span className='absolute -top-0.5 -right-0.5 size-1.5 bg-white' />
        <span className='absolute -bottom-0.5 -left-0.5 size-1.5 bg-white' />
        <span className='absolute -bottom-0.5 -right-0.5 size-1.5 bg-white' />
        <p className='text-[7px] font-bold tracking-wide truncate'>{unit.toUpperCase()}</p>
      </div>

      {/* Name */}
      <div className='text-center px-1.5 py-1 flex-shrink-0'>
        <p className='text-[5px] font-bold tracking-widest text-lime-100/80'>REGISTERED MEMBER</p>
        <p className='text-[8px] font-black leading-tight mt-0.5 line-clamp-2'>{name.toUpperCase()}</p>
        {user.memberNo && (
          <p className='text-[5px] text-emerald-200 mt-0.5'>No: {user.memberNo}</p>
        )}
      </div>

      {/* MEMBER badge */}
      <div className='mx-auto bg-white text-emerald-950 text-[5px] font-black tracking-widest px-2 py-0.5 flex-shrink-0'>
        MEMBER
      </div>

      {/* QR */}
      <div className='flex flex-1 items-center justify-center py-1 min-h-0'>
        {qrImage ? (
          <img
            src={qrImage}
            alt='QR'
            className='max-h-full max-w-full rounded p-0.5 bg-white'
            style={{ maxWidth: '60%', aspectRatio: '1' }}
          />
        ) : (
          <div className='size-8 rounded bg-white/10' />
        )}
      </div>

      {/* Footer */}
      <div className='text-center py-1 flex-shrink-0'>
        <p className='text-[5px] font-bold tracking-wider text-lime-50'>SCAN TO VERIFY</p>
      </div>
    </div>
  )
}
