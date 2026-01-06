import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// メール送信（Resend API使用、ローカルはSMTPにフォールバック）
async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('EMAIL_FROM') || 'noreply@example.com'

  // Resend APIキーがある場合はResendを使用
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          text: body,
        }),
      })

      if (response.ok) {
        console.log(`Email sent via Resend to: ${to}`)
        return true
      } else {
        const errorData = await response.text()
        console.error(`Resend API error: ${errorData}`)
        return false
      }
    } catch (error) {
      console.error('Resend error:', error)
      return false
    }
  }

  // ローカル開発用: SMTP
  const smtpHost = Deno.env.get('SMTP_HOST') || 'supabase_inbucket_my-map'
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '1025')

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  try {
    const conn = await Deno.connect({ hostname: smtpHost, port: smtpPort })

    const read = async (): Promise<string> => {
      const buf = new Uint8Array(1024)
      const n = await conn.read(buf)
      return decoder.decode(buf.subarray(0, n || 0))
    }

    const write = async (data: string): Promise<void> => {
      await conn.write(encoder.encode(data + '\r\n'))
    }

    await read()
    await write(`EHLO localhost`)
    await read()
    await write(`MAIL FROM:<${fromEmail}>`)
    await read()
    await write(`RCPT TO:<${to}>`)
    await read()
    await write('DATA')
    await read()

    const emailContent = [
      `From: ${fromEmail}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      body,
      '.',
    ].join('\r\n')

    await write(emailContent)
    await read()
    await write('QUIT')

    conn.close()
    console.log(`Email sent via SMTP to: ${to}`)
    return true
  } catch (error) {
    console.error('SMTP error:', error)
    return false
  }
}

serve(async (req) => {
  // CORSプリフライト
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      email,
      reviewerName,
      facilityName,
      giftCode,
      giftAmount,
      expiresAt
    } = await req.json()

    if (!email || !giftCode || !giftAmount) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formattedAmount = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(giftAmount)

    // 有効期限をフォーマット
    const formattedExpiresAt = expiresAt
      ? new Date(expiresAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
      : null

    const body = `${reviewerName} 様

この度は${facilityName}のクチコミ投稿ありがとうございました。

お礼として、下記のギフトコードをお送りいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ギフトコード: ${giftCode}
金額: ${formattedAmount}${formattedExpiresAt ? `
有効期限: ${formattedExpiresAt}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

※本コードは1回限り有効です。${formattedExpiresAt ? '' : `
※有効期限にご注意ください。`}

今後ともよろしくお願いいたします。
`

    const success = await sendEmail(
      email,
      `クチコミ投稿ありがとうございます - ギフトコードのご案内`,
      body
    )

    return new Response(
      JSON.stringify({ success }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-gift-code-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
