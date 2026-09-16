'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MailCheck, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setErrorMsg('Kayıt oluşturulamadı: ' + error.message)
    } else {
      setIsSuccess(true)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-orange-50/40">
        <Card className="w-full max-w-md shadow-sm border-orange-100 text-center p-6 bg-white">
          <CardContent className="pt-6">
            <MailCheck className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-orange-950 mb-2">Doğrulama E-postası Gönderildi</h2>
            <p className="text-orange-900/70 text-sm mb-6">
              Kayıt işlemini tamamlamak için lütfen e-posta adresinize gelen onay linkine tıklayın.
            </p>
            <div className="space-y-2">
              <Link href="/login">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Giriş Ekranına Git</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full text-orange-800">Ana Sayfaya Dön</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-orange-50/40">
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-orange-800 hover:text-orange-950 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Ana Sayfaya Dön
        </Link>
        <span className="font-bold text-orange-600 text-sm tracking-tight">msvebeslenme</span>
      </div>

      <Card className="w-full max-w-md shadow-sm border-orange-100 bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-950">Danışan Kaydı</CardTitle>
          <CardDescription>Eğitim video arşivine erişmek için hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-orange-950 block mb-1">E-posta</label>
              <Input name="email" type="email" required placeholder="ornek@mail.com" className="focus-visible:ring-orange-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-orange-950 block mb-1">Şifre</label>
              <Input name="password" type="password" required minLength={6} placeholder="En az 6 karakter" className="focus-visible:ring-orange-500" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5">
              {loading ? 'Kayıt Yapılıyor...' : 'Hesap Oluştur'}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-orange-600 font-semibold hover:underline">
                Giriş Yap
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}