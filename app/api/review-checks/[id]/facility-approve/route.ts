import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SMTP_HOST = process.env.SMTP_HOST || 'localhost'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '1025')
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@example.com'
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map(email => email.trim()).filter(Boolean)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// 簡易SMTPクライアント
async function sendEmailViaSMTP(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const net = await import('net')

    return new Promise((resolve) => {
      const client = net.createConnection({ host: SMTP_HOST, port: SMTP_PORT }, () => {
        let step = 0
        const commands = [
          `EHLO localhost`,
          `MAIL FROM:<${SMTP_FROM}>`,
          `RCPT TO:<${to}>`,
          'DATA',
          [
            `From: ${SMTP_FROM}`,
            `To: ${to}`,
            `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            '',
            body,
            '.',
          ].join('\r\n'),
          'QUIT',
        ]

        client.on('data', () => {
          if (step < commands.length) {
            client.write(commands[step] + '\r\n')
            step++
          }
        })

        client.on('end', () => {
          resolve(true)
        })

        client.on('error', (err) => {
          console.error('SMTP error:', err)
          resolve(false)
        })
      })

      client.on('error', (err) => {
        console.error('SMTP connection error:', err)
        resolve(false)
      })
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// 管理者承認依頼メール送信（複数の管理者に送信）
async function sendAdminApprovalRequestEmail(
  reviewCheckId: number,
  adminApprovalToken: string,
  reviewerName: string,
  facilityName: string,
  reviewUrl: string | null
): Promise<boolean> {
  const approvalUrl = `${BASE_URL}/api/review-checks/${reviewCheckId}/admin-approve?token=${adminApprovalToken}`

  const body = `管理者様

施設オーナーによるクチコミ承認が完了しました。
以下のリンクから最終承認をお願いします。

━━━━━━━━━━━━━━━━━━━━━━━━
施設名: ${facilityName}
投稿者: ${reviewerName} 様
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
    ADMIN_EMAILS.map(email =>
      sendEmailViaSMTP(
        email,
        `【管理者承認依頼】${facilityName} のクチコミ承認`,
        body
      )
    )
  )

  // 少なくとも1件成功すればtrueを返す
  return results.some(result => result === true)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewCheckId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'トークンが必要です' }, { status: 400 })
    }

    const supabase = await createClient()

    // トークン検証とレコード取得
    const { data: reviewCheck, error: reviewCheckError } = await supabase
      .from('review_checks')
      .select('facility_approval_token, admin_approval_token, reviewer_name, facility_id, is_approved, review_url')
      .eq('id', reviewCheckId)
      .single()

    if (reviewCheckError || !reviewCheck) {
      return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 })
    }

    if (reviewCheck.facility_approval_token !== token) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 403 })
    }

    // 既に承認済みの場合はスキップ
    if (reviewCheck.is_approved) {
      return NextResponse.json({ message: '既に承認済みです' }, { status: 200 })
    }

    // 施設情報を取得
    const { data: facilityDetail, error: facilityError } = await supabase
      .from('facility_details')
      .select('name')
      .eq('facility_id', reviewCheck.facility_id)
      .single()

    if (facilityError || !facilityDetail) {
      console.error('Error fetching facility detail:', facilityError)
      return NextResponse.json({ error: '施設情報が見つかりません' }, { status: 404 })
    }

    // review_checks.is_approved を true に更新
    const { error: updateError } = await supabase
      .from('review_checks')
      .update({ is_approved: true })
      .eq('id', reviewCheckId)

    if (updateError) {
      console.error('Error updating review check:', updateError)
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
    }

    // 管理者へ承認依頼メールを送信
    const emailSent = await sendAdminApprovalRequestEmail(
      parseInt(reviewCheckId),
      reviewCheck.admin_approval_token,
      reviewCheck.reviewer_name,
      facilityDetail.name,
      reviewCheck.review_url
    )

    if (!emailSent) {
      console.error(`Failed to send admin approval email for review_check_id: ${reviewCheckId}`)
      // review_checks.status を failed に更新
      await supabase
        .from('review_checks')
        .update({ status: 'failed' })
        .eq('id', reviewCheckId)
      return NextResponse.json({ error: '管理者への通知メール送信に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '施設承認が完了しました' })
  } catch (error) {
    console.error('Error in facility-approve API:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// GETリクエストでも承認できるようにする（メールのリンククリック用）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(request, { params })
}
