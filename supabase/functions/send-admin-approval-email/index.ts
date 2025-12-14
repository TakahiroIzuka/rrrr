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
      reviewCheckId,
      adminApprovalToken,
      reviewerName,
      reviewerEmail,
      googleAccountName,
      facilityName,
      facilityUrl,
      reviewUrl
    } = await req.json()

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
    const approvalUrl = `${baseUrl}/api/review-checks/${reviewCheckId}/admin-approve?token=${adminApprovalToken}`

    const body = `管理者様

施設オーナーによるクチコミ承認が完了しました。
以下のリンクから最終承認をお願いします。

━━━━━━━━━━━━━━━━━━━━━━━━
お名前: ${reviewerName} 様
メールアドレス: ${reviewerEmail}
Googleアカウント名: ${googleAccountName}
施設名: ${facilityName}
施設URL: ${facilityUrl || '未設定'}
クチコミURL: ${reviewUrl || '未取得'}
施設承認: 完了
━━━━━━━━━━━━━━━━━━━━━━━━

▼ 承認する場合は以下のリンクをクリックしてください
${approvalUrl}

※このメールは自動送信されています。
※このリンクは本メールの受信者専用です。第三者への共有はお控えください。
`

    // 全ての管理者にメール送信
    const results = await Promise.all(
      adminEmails.map((email: string) =>
        sendEmail(
          email,
          `【管理者承認依頼】${facilityName} のクチコミ承認`,
          body
        )
      )
    )

    // 少なくとも1件成功すればtrueを返す
    const success = results.some(result => result === true)
    const successCount = results.filter(r => r).length
    const failCount = results.filter(r => !r).length

    console.log(`Admin approval emails sent: ${successCount} success, ${failCount} failed`)

    return new Response(
      JSON.stringify({
        success,
        sent: successCount,
        failed: failCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-admin-approval-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
