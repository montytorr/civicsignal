import Link from 'next/link'
import { Eyebrow } from '@civicsignal/ui'

type Commitment = {
  id: string
  poll_id: string
  merkle_root: string
  batch_type: string
  created_at: string
  polls: { question: string } | null
}

interface Props {
  commitments: Commitment[]
  receiptHash?: string | null
}

const BATCH_TYPE_LABELS: Record<string, string> = {
  vote: 'Vote seal',
  tally: 'Tally',
  resolution: 'Resolution',
}

const truncateRoot = (root: string) =>
  root.length > 20 ? root.slice(0, 10) + '…' + root.slice(-10) : root

const formatTs = (iso: string) =>
  new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'

export const VerifyPage = ({ commitments, receiptHash }: Props) => (
  <div style={{ background: 'var(--color-parchment-bg)', color: 'var(--color-parchment-ink)', minHeight: '100%' }}>

    {/* HERO BAND */}
    <section style={{ borderBottom: '1px solid #D9D1BD' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '64px 40px 32px',
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: 56,
          alignItems: 'end',
        }}
      >
        <div>
          <Eyebrow>Public audit</Eyebrow>
          <h1
            style={{
              margin: '14px 0 0',
              fontSize: 52,
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: '#0E1F36',
              textWrap: 'balance' as never,
            }}
          >
            Commitment verification.
          </h1>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.55,
            color: '#3A4861',
            maxWidth: 540,
            textWrap: 'pretty' as never,
          }}
        >
          Every sealed vote set is hashed into a Merkle root before cutoff. These roots are
          published here so anyone can verify that no votes were added or changed after sealing.
          Re-hash the data yourself and compare against the root — they must match.
        </p>
      </div>
    </section>

    {/* COMMITMENTS TABLE */}
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 96px' }}>
      {receiptHash && (
        <div style={{ marginBottom: 24, padding: '18px 22px', background: '#FBF8F1', border: '1px solid #D9D1BD', borderRadius: 4 }}>
          <Eyebrow>Receipt lookup</Eyebrow>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#3A4861', lineHeight: 1.5 }}>
            Receipt <span className="font-mono" style={{ color: '#0E1F36' }}>{truncateRoot(receiptHash)}</span> is your private vote receipt.
            It proves what your browser sealed at submission time. It will become publicly auditable once the poll closes and its vote batch Merkle root is published below.
          </p>
        </div>
      )}
      {commitments.length === 0 ? (
        <p style={{ fontSize: 14.5, color: '#6B7488', margin: 0 }}>
          No commitments published yet. They appear here once a poll is sealed.
        </p>
      ) : (
        <>
          {/* Column headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 1fr 160px',
              gap: 24,
              paddingBottom: 12,
              borderBottom: '1px solid #D9D1BD',
            }}
          >
            {(['Poll', 'Type', 'Merkle root', 'Sealed at'] as const).map((h) => (
              <span
                key={h}
                className="font-mono"
                style={{ fontSize: 10.5, color: '#6B7488', letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {commitments.map((c, i) => (
            <div
              key={c.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 1fr 160px',
                gap: 24,
                padding: '20px 0',
                borderBottom: i < commitments.length - 1 ? '1px solid #E5DEC9' : 'none',
                alignItems: 'center',
              }}
            >
              {/* Poll question */}
              <div>
                {c.polls ? (
                  <Link
                    href={`/polls/${c.poll_id}`}
                    style={{
                      fontSize: 14,
                      color: '#0E1F36',
                      textDecoration: 'none',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {c.polls.question}
                  </Link>
                ) : (
                  <span
                    className="font-mono"
                    style={{ fontSize: 11.5, color: '#6B7488' }}
                  >
                    {c.poll_id}
                  </span>
                )}
              </div>

              {/* Batch type */}
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 11.5,
                  color: '#3A4861',
                  background: '#F0EBE0',
                  border: '1px solid #D9D1BD',
                  borderRadius: 3,
                  padding: '3px 8px',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  alignSelf: 'start',
                  marginTop: 2,
                }}
              >
                {BATCH_TYPE_LABELS[c.batch_type] ?? c.batch_type}
              </span>

              {/* Merkle root */}
              <span
                className="font-mono"
                style={{
                  fontSize: 11.5,
                  color: '#3A4861',
                  wordBreak: 'break-all',
                  lineHeight: 1.4,
                }}
                title={c.merkle_root}
              >
                {truncateRoot(c.merkle_root)}
              </span>

              {/* Timestamp */}
              <span
                className="font-mono"
                style={{ fontSize: 11.5, color: '#6B7488', whiteSpace: 'nowrap' }}
              >
                {formatTs(c.created_at)}
              </span>
            </div>
          ))}
        </>
      )}
    </section>

  </div>
)
