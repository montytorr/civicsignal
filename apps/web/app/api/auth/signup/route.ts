import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { generateHandle } from '@/lib/handle-generator'
import { sendConfirmationEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://civicsignal.montytorr.tech'

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string }
    const cleanEmail = email?.trim().toLowerCase()
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const handle = generateHandle()
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: cleanEmail,
      password,
      options: {
        data: { handle },
        redirectTo: `${APP_URL}/auth/callback?next=/onboarding`,
      },
    })

    if (error || !data.properties?.action_link) {
      return NextResponse.json({ success: false, error: error?.message ?? 'Could not create confirmation link' }, { status: 500 })
    }

    const emailResult = await sendConfirmationEmail({ to: cleanEmail, confirmationUrl: data.properties.action_link, handle })
    if (emailResult.error) {
      return NextResponse.json({ success: false, error: `Account link created but email failed: ${emailResult.error}` }, { status: 502 })
    }

    return NextResponse.json({ success: true, handle, emailId: emailResult.id })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
