'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg('Giriş başarısız. E-posta veya şifrenizi kontrol ediniz.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md shadow-sm border-emerald-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-950">Giriş Yap</CardTitle>
          <CardDescription>msvebeslenme danışan paneline erişin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-emerald-950 block mb-1">E-posta</label>
              <Input name="email" type="email" required placeholder="ornek@mail.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-emerald-950 block mb-1">Şifre</label>
              <Input name="password" type="password" required placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Hesabınız yok mu?{' '}
              <Link href="/register" className="text-emerald-700 font-semibold hover:underline">
                Kayıt Ol
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}