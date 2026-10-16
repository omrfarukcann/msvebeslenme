import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { fullname, phone, age, motivation_score } = await request.json()

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    // Eğer env tanımlanmadıysa sessizce geç
    if (!botToken || !chatId) {
      return NextResponse.json({ ok: true, notice: 'Telegram envs not configured' })
    }

    const message = `🔔 *Yeni Danışan Başvurusu!*\n\n` +
      `👤 *Ad Soyad:* ${fullname}\n` +
      `📞 *Telefon:* ${phone}\n` +
      `🎂 *Yaş:* ${age || '-'}\n` +
      `⭐ *Motivasyon:* ${motivation_score || '-'}/10\n\n` +
      `Detayları incelemek için yönetim paneline giriş yapabilirsiniz: https://msvebeslenme.com/admin`

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}