'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string

    // 1. Şifreyi güncelle
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      // 2. Kurtarma oturumunu temizle ki temiz giriş yapılabilsin
      await supabase.auth.signOut()
      setLoading(false)
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-orange-50/40">
      <Card className="w-full max-w-md shadow-sm border-orange-100 bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-stone-900">Yeni Şifre Belirleyin</CardTitle>
          <CardDescription>Lütfen hesabınız için yeni ve güçlü bir şifre giriniz</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">Şifreniz Başarıyla Güncellendi!</h3>
                <p className="text-xs text-stone-500">
                  Artık yeni şifrenizle danışan panelinize giriş yapabilirsiniz.
                </p>
              </div>
              <Button 
                onClick={() => { window.location.href = '/login' }} 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer"
              >
                Giriş Ekranına Git <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">Yeni Şifreniz</label>
                <Input name="password" type="password" required minLength={6} placeholder="En az 6 karakter" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
                {loading ? 'Güncelleniyor...' : 'Şifreyi Kaydet'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}