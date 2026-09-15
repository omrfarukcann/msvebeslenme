import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock } from 'lucide-react'

function getEmbedUrl(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('is_authorized')
    .eq('id', user?.id)
    .single()

  if (!profile?.is_authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-md w-full border-amber-200 bg-amber-50/40 text-center p-4">
          <CardHeader>
            <Clock className="w-12 h-12 text-amber-600 mx-auto mb-2" />
            <CardTitle className="text-amber-950 text-xl">Onay Bekleniyor</CardTitle>
            <CardDescription className="text-amber-800/80">
              Kayıt işleminiz alındı. Diyetisyeniniz onayladıktan sonra içeriklere buradan erişebileceksiniz.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('order', { ascending: true })

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-950">Eğitim Paneli</h1>
        <p className="text-emerald-800 text-sm mt-1">MS ve Beslenme sürecinize özel hazırlanmış eğitim serisi.</p>
      </div>

      <div className="grid gap-8">
        {videos && videos.length > 0 ? (
          videos.map((vid) => (
            <Card key={vid.id} className="overflow-hidden border-emerald-100">
              <div className="aspect-video w-full bg-slate-900">
                <iframe
                  src={getEmbedUrl(vid.youtube_url) || ''}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={vid.title}
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-emerald-950 mb-2">{vid.title}</h3>
                <p className="text-emerald-900/70 text-sm leading-relaxed whitespace-pre-line">
                  {vid.description}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-12">Henüz yayınlanmış eğitim videosu bulunmuyor.</p>
        )}
      </div>
    </div>
  )
}
