'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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

    // 1. Auth Girişi
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !authData.user) {
      setErrorMsg(error?.message || 'Giriş başarısız. Bilgilerinizi kontrol ediniz.')
      setLoading(false)
      return
    }

    // 2. Rol Kontrolü: Admin mi Danışan mı?
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    setLoading(false)

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
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
          <CardTitle className="text-2xl font-bold text-orange-950">Giriş Yap</CardTitle>
          <CardDescription>Danışan veya Yönetici hesabınıza erişin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              <Input name="password" type="password" required placeholder="••••••••" className="focus-visible:ring-orange-500" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm font-medium py-2.5">
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Hesabınız yok mu?{' '}
              <Link href="/register" className="text-orange-600 font-semibold hover:underline">
                Kayıt Ol
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}