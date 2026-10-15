'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Star, MessageSquareHeart, CheckCircle2 } from 'lucide-react'

export function DashboardReviewForm({ userId }: { userId: string }) {
  const supabase = createClient()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const payload = {
      user_id: userId,
      fullname: (formData.get('fullname') as string).trim(),
      rating,
      comment: (formData.get('comment') as string).trim(),
      is_approved: false
    }

    const { error } = await supabase.from('reviews').insert([payload])
    setLoading(false)

    if (!error) {
      setSubmitted(true)
    } else {
      alert('Yorum gönderilirken hata: ' + error.message)
    }
  }

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/60 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
        <h3 className="font-bold text-emerald-950 text-base">Değerlendirmeniz Alındı!</h3>
        <p className="text-xs text-emerald-800/80 mt-1">
          Deneyiminizi paylaştığınız için teşekkürler. Yorumunuz diyetisyeniniz onayladıktan sonra ana sayfada soyadınız gizlenerek (Örn: Ahmet Y****) yayınlanacaktır.
        </p>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-lg font-bold text-stone-900">Danışmanlık Deneyiminizi Paylaşın</CardTitle>
        </div>
        <CardDescription className="text-xs text-stone-500">
          Bu süreçte aldığınız beslenme rehberliği ve yaşam kalitenizdeki değişim hakkında yorum bırakabilirsiniz. Soyadınız ana sayfada otomatik filtrelenecektir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-stone-800">Puanınız</Label>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer transition-transform hover:scale-110 p-1"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-stone-300'
                    }`} 
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-700 ml-2">{rating} / 5</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-stone-800">Adınız ve Soyadınız *</Label>
            <Input name="fullname" placeholder="Adınız Soyadınız (Örn: Ahmet Yılmaz)" required />
            <span className="text-[11px] text-stone-400 block mt-1">Ana sayfada "Ahmet Y****" şeklinde görünecektir.</span>
          </div>

          <div>
            <Label className="text-xs font-semibold text-stone-800">Yorumunuz / Deneyiminiz *</Label>
            <Textarea 
              name="comment" 
              rows={3} 
              placeholder="Beslenme düzeninizin semptomlarınıza ve hayatınıza nasıl dokunduğunu anlatın..." 
              required 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
            {loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}