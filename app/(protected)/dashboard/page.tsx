import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/SignOutButton'
import { Clock, PlayCircle, Home, Sparkles, Video as VideoIcon, Calendar } from 'lucide-react'
import Link from 'next/link'

// Akıllı ve Korumalı Embed URL Çıkarıcı
function getEmbedUrl(url: string) {
  if (!url) return null

  // 1. YouTube Linki
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${ytMatch[2]}?modestbranding=1&rel=0&iv_load_policy=3`
  }

  // 2. Google Drive Linki
  if (url.includes('drive.google.com')) {
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    }
  }

  return url
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('is_authorized')
    .eq('id', user?.id)
    .single()

  // Onay Bekleyen Danışan
  if (!profile?.is_authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-orange-800 hover:text-orange-950 mb-6">
          <Home className="w-4 h-4 mr-1.5" /> Ana Sayfaya Git
        </Link>
        <Card className="max-w-md w-full border-amber-200 bg-white text-center p-8 shadow-sm">
          <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Onay Bekleniyor</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            Kayıt işleminiz alındı. Diyetisyeniniz hesabınızı onayladıktan sonra eğitim videolarına ve canlı grup toplantılarına buradan erişebileceksiniz.
          </p>
          <SignOutButton className="w-full justify-center" />
        </Card>
      </div>
    )
  }

  // Onaylı Danışan Verileri
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('order', { ascending: true })

  const { data: meetingData } = await supabase
    .from('meetings')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)

  const activeMeeting = meetingData && meetingData.length > 0 ? meetingData[0] : null

  return (
    <div className="min-h-screen bg-stone-50/70 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 py-6 px-6 md:px-12 mb-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link href="/" className="inline-flex items-center text-xs font-semibold text-orange-700 hover:underline">
                <Home className="w-3.5 h-3.5 mr-1" /> msvebeslenme.com
              </Link>
              <span className="text-stone-300">/</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Danışan Özel Portalı
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Eğitim & Toplantı Portalı</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-orange-200 text-orange-950 hover:bg-orange-50">
                <Home className="w-4 h-4 mr-1.5" /> Ana Sayfa
              </Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Canlı Toplantı Banner Kartı */}
        {activeMeeting && (
          <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" /> Canlı Grup Toplantısı
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">{activeMeeting.title}</h2>
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-100">
                  <Calendar className="w-4 h-4" /> {activeMeeting.meeting_date}
                </div>
                {activeMeeting.notes && (
                  <p className="text-xs md:text-sm text-orange-50/90 leading-relaxed pt-1">
                    {activeMeeting.notes}
                  </p>
                )}
              </div>
              <a href={activeMeeting.meeting_url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto bg-white text-orange-950 hover:bg-orange-50 font-bold px-8 py-6 rounded-xl shadow-lg hover:scale-105 transition-transform">
                  <VideoIcon className="w-5 h-5 mr-2 text-orange-600" /> Toplantıya Katıl
                </Button>
              </a>
            </div>
          </Card>
        )}

        {/* Eğitim Videoları */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-orange-600" /> Eğitim Video Arşivi
          </h2>

          {videos && videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map((vid, idx) => (
                <Card key={vid.id} className="overflow-hidden border-stone-200/80 shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col">
                  <div className="aspect-video w-full bg-stone-950 relative group">
                    <iframe
                      src={getEmbedUrl(vid.youtube_url) || ''}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={vid.title}
                    />
                    {/* Üst Şeffaf Güvenlik Şeridi (onContextMenu hatasından arındırıldı) */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-14 bg-transparent z-10 pointer-events-auto select-none"
                      title="msvebeslenme Özel İçeriği"
                    />
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-orange-600 text-xs font-bold">
                        <PlayCircle className="w-4 h-4" /> Video {idx + 1}
                      </div>
                      <h3 className="text-xl font-bold text-stone-900 mb-2">{vid.title}</h3>
                      <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                        {vid.description || 'Bu video için açıklama girilmemiş.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
              <p className="text-stone-500 text-sm">Henüz yayınlanmış bir eğitim videosu bulunmuyor.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}