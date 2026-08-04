import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://civicsignal.montytorr.com'
const FROM = process.env.RESEND_FROM || 'CivicSignal <noreply@civicsignal.montytorr.com>'

type EmailResult = { id?: string; error?: string }

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const getClient = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not configured')
  return new Resend(key)
}

const layout = ({ preview, heading, body, ctaLabel, ctaUrl }: { preview: string; heading: string; body: string; ctaLabel: string; ctaUrl: string }) => `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(preview)}</title></head>
<body style="margin:0;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0E1F36;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
  <main style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6B7488;margin-bottom:18px;">CivicSignal</div>
    <section style="background:#FBF8F1;border:1px solid #D9D1BD;border-radius:6px;padding:32px;">
      <h1 style="font-size:24px;line-height:1.25;font-weight:600;letter-spacing:-.02em;margin:0 0 14px;color:#0E1F36;">${escapeHtml(heading)}</h1>
      <p style="font-size:15px;line-height:1.6;color:#3A4861;margin:0 0 24px;">${body}</p>
      <a href="${ctaUrl}" style="display:inline-block;background:#0E1F36;color:#FBF8F1;text-decoration:none;border-radius:4px;padding:12px 18px;font-size:14px;font-weight:600;">${escapeHtml(ctaLabel)}</a>
    </section>
    <p style="font-size:12px;line-height:1.5;color:#6B7488;margin:18px 0 0;">Public-good civic infrastructure. No wagering. No tradable tokens. No accounts you can sell.</p>
  </main>
</body></html>`

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }): Promise<EmailResult> => {
  try {
    const result = await getClient().emails.send({ from: FROM, to, subject, html })
    if (result.error) return { error: result.error.message }
    return { id: result.data?.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown email error' }
  }
}

export const sendConfirmationEmail = async ({ to, confirmationUrl, handle }: { to: string; confirmationUrl: string; handle: string }): Promise<EmailResult> =>
  sendEmail({
    to,
    subject: 'Confirm your CivicSignal account',
    html: layout({
      preview: 'Confirm your CivicSignal account',
      heading: `Confirm ${handle}`,
      body: 'You are one step away from joining CivicSignal. Confirm your email, then you can vote on active civic polls, propose new questions, and build non-transferable topic reputation.',
      ctaLabel: 'Confirm account',
      ctaUrl: confirmationUrl,
    }),
  })

export const sendWelcomeEmail = async ({ to, handle }: { to: string; handle: string }): Promise<EmailResult> =>
  sendEmail({
    to,
    subject: 'Welcome to CivicSignal',
    html: layout({
      preview: 'Welcome to CivicSignal',
      heading: `Welcome, ${handle}`,
      body: 'Your account is ready. Start with the guided civic loop, vote on an active poll, or propose a well-sourced civic question for moderation.',
      ctaLabel: 'Start onboarding',
      ctaUrl: `${APP_URL}/onboarding`,
    }),
  })
