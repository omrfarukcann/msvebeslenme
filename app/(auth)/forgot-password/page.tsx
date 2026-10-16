'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setErrorMsg(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-orange-50/40">
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link href="/login" className="inline-flex items-center text-sm font-semibold text-orange-800 hover:text-orange-950">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Giriş Ekranına Dön
        </Link>
        <span className="font-extrabold text-orange-600 text-sm">msvebeslenme</span>
      </div>

      <Card className="w-full max-w-md shadow-sm border-orange-100 bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-stone-900">Şifremi Unuttum</CardTitle>
          <CardDescription>Kayıtlı e-posta adresinize sıfırlama bağlantısı göndereceğiz</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <MailCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="text-sm text-stone-700">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve gereksiz/spam klasörünü) kontrol ediniz.
              </p>
              <Link href="/login" className="block pt-2">
                <Button variant="outline" className="w-full">Giriş Yap</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">E-posta Adresiniz</label>
                <Input name="email" type="email" required placeholder="ornek@mail.com" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}