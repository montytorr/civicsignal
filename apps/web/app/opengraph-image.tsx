import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CivicSignal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#F5F1E8',
          color: '#0E1F36',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 500, letterSpacing: '-0.02em' }}>CivicSignal</div>
        <div style={{ fontSize: 24, color: '#3A4861', marginTop: 16 }}>
          Verified-human polling for public intelligence.
        </div>
      </div>
    ),
    { ...size }
  )
}
