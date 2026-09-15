'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function BasvuruPage() {
  const supabase = createClient()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const payload = {
      fullname: formData.get('fullname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
    }

    const { error } = await supabase.from('forms').insert([payload])

    setLoading(false)
    if (!error) {
      setSubmitted(true)
    } else {
      alert('Form gönderilirken bir hata oluştu: ' + error.message)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-md w-full text-center p-6 border-emerald-100">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-950 mb-2">Başvurunuz Alındı!</h2>
            <p className="text-emerald-900/70 mb-6">
              Hikayenizi paylaştığınız için teşekkürler. En kısa sürede sizinle iletişime geçeceğim.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-emerald-700 hover:bg-emerald-800">
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-6 flex justify-center items-center bg-slate-50">
      <Card className="max-w-xl w-full border-emerald-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-emerald-950 font-bold">Beslenme Danışmanlığı Başvuru Formu</CardTitle>
          <CardDescription>
            Sizi daha yakından tanımak ve size özel bir beslenme planı oluşturmak için formu eksiksiz doldurunuz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-emerald-950 block mb-1">Ad Soyad</label>
              <Input name="fullname" required placeholder="Adınız Soyadınız" />
            </div>
            <div>
              <label className="text-sm font-medium text-emerald-950 block mb-1">E-posta</label>
              <Input name="email" type="email" required placeholder="ornek@mail.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-emerald-950 block mb-1">Telefon</label>
              <Input name="phone" type="tel" required placeholder="05XXXXXXXXX" />
            </div>
            <div>
              <label className="text-sm font-medium text-emerald-950 block mb-1">MS Hikayeniz / Şikayetleriniz</label>
              <Textarea 
                name="message" 
                rows={4} 
                required 
                placeholder="Teşhis yılınız, semptomlarınız ve bu programdan beklentileriniz..." 
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
              {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
