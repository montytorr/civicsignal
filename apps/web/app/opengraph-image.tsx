import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CivicSignal — verified-human civic polling'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f7f0df 0%, #efe3c8 58%, #d9c6a2 100%)',
          color: '#201b14',
          fontFamily: 'Inter, Arial, sans-serif',
          padding: 54,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -90,
            top: -120,
            width: 500,
            height: 500,
            borderRadius: 999,
            background: 'rgba(47, 111, 104, 0.18)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            border: '1px solid #c9b58d',
            borderRadius: 32,
            background: 'rgba(255, 248, 234, 0.72)',
            padding: '46px 52px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                width: 148,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 22,
                background: '#173f3b',
                color: '#f7f0df',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              CIVIC TECH
            </div>
            <div style={{ display: 'flex', marginTop: 64, fontSize: 90, fontWeight: 750, letterSpacing: -4 }}>
              CivicSignal
            </div>
            <div style={{ display: 'flex', marginTop: 18, fontSize: 32, fontWeight: 500, color: '#4f4638' }}>
              Verified-human civic polling for auditable public opinion.
            </div>
            <div style={{ display: 'flex', marginTop: 48, fontSize: 22, color: '#625744', fontFamily: 'monospace' }}>
              propose → vote → resolve → audit → reputation
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 20, fontWeight: 700 }}>
            <div style={{ display: 'flex', padding: '14px 22px', borderRadius: 16, background: '#2f6f68', color: '#fff8ea' }}>
              Open source
            </div>
            <div style={{ display: 'flex', padding: '14px 22px', borderRadius: 16, border: '1px solid #9e8b68', color: '#3c3327' }}>
              No wagering
            </div>
            <div style={{ display: 'flex', padding: '14px 22px', borderRadius: 16, border: '1px solid #9e8b68', color: '#3c3327' }}>
              Public audit trail
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
