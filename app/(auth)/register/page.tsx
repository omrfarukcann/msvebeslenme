'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setErrorMsg('Kayıt oluşturulamadı: ' + error.message)
      setLoading(false)
    } else {
      // Kayıt başarılı olduğunda kullanıcı doğrudan dashboard'a yönlenir
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md shadow-sm border-emerald-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-950">Kayıt Ol</CardTitle>
          <CardDescription>Eğitim içeriklerine erişmek için hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
              <Input name="password" type="password" required minLength={6} placeholder="En az 6 karakter" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
              {loading ? 'Kayıt Yapılıyor...' : 'Hesap Oluştur'}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                Giriş Yap
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}