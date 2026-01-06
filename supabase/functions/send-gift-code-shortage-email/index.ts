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
      facilityName,
      facilityId,
      giftAmount,
      reviewerName,
      reviewerEmail,
      reason,
      reviewCheckId,
      adminApprovalToken
    } = await req.json()

    if (!facilityName) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isNotConfigured = reason === 'not_configured'
    const hasResendUrl = reviewCheckId && adminApprovalToken

    // 環境変数からADMIN_EMAILSを取得
    const adminEmailsEnv = Deno.env.get('ADMIN_EMAILS') || ''
    const adminEmails = adminEmailsEnv.split(',').map(email => email.trim()).filter(Boolean)

    if (adminEmails.length === 0) {
      console.error('ADMIN_EMAILS environment variable is not set or empty')
      return new Response(
        JSON.stringify({ error: 'ADMIN_EMAILS is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const baseUrl = Deno.env.get('NEXT_PUBLIC_BASE_URL') || 'http://localhost:3000'
    const formattedAmount = giftAmount
      ? new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(giftAmount)
      : '未設定'

    let subject: string
    let body: string

    const resendUrl = hasResendUrl
      ? `${baseUrl}/api/review-checks/${reviewCheckId}/resend-gift-code?token=${adminApprovalToken}`
      : null
    const facilityEditUrl = facilityId
      ? `${baseUrl}/management/facilities/${facilityId}/edit`
      : `${baseUrl}/management`

    if (isNotConfigured) {
      subject = `【要対応】ギフトコード金額未設定 - ${facilityName}`
      body = `管理者様

施設にギフトコード金額が設定されていないため、
以下のクチコミ投稿者へギフトコードを送信できませんでした。

━━━━━━━━━━━━━━━━━━━━━━━━━━━
施設名: ${facilityName}
投稿者名: ${reviewerName}
投稿者メール: ${reviewerEmail}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

施設のギフトコード金額を設定後、以下のURLをクリックして再送信してください。

▼ 施設設定画面
${facilityEditUrl}
${resendUrl ? `
▼ ギフトコード再送信（設定完了後にクリック）
${resendUrl}
` : `
管理画面URL: ${baseUrl}/management
`}`
    } else {
      subject = `【要対応】ギフトコード在庫切れ - ${facilityName}`
      body = `管理者様

ギフトコードの在庫が不足しているため、
以下のクチコミ投稿者へギフトコードを送信できませんでした。

━━━━━━━━━━━━━━━━━━━━━━━━━━━
施設名: ${facilityName}
対象金額: ${formattedAmount}
投稿者名: ${reviewerName}
投稿者メール: ${reviewerEmail}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

ギフトコードを追加登録後、以下のURLをクリックして再送信してください。
${resendUrl ? `
▼ ギフトコード再送信
${resendUrl}
` : `
管理画面URL: ${baseUrl}/management
`}`
    }

    // 全ての管理者にメール送信
    const results = await Promise.all(
      adminEmails.map((email: string) =>
        sendEmail(
          email,
          subject,
          body
        )
      )
    )

    // 少なくとも1件成功すればtrueを返す
    const success = results.some(result => result === true)
    const successCount = results.filter(r => r).length
    const failCount = results.filter(r => !r).length

    console.log(`Gift code shortage emails sent: ${successCount} success, ${failCount} failed`)

    return new Response(
      JSON.stringify({
        success,
        sent: successCount,
        failed: failCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-gift-code-shortage-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
