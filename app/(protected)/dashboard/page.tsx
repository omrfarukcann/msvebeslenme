import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/SignOutButton'
import { ProtectedVideoPlayer } from '@/components/ProtectedVideoPlayer'
import { DashboardReviewForm } from '@/components/DashboardReviewForm'
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp'
import { 
  Clock, 
  PlayCircle, 
  Home, 
  Sparkles, 
  Video as VideoIcon, 
  Calendar, 
  Layers, 
  Lock, 
  History, 
  ExternalLink 
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('is_authorized, role, allowed_sections')
    .eq('id', user?.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const isAuthorized = profile?.is_authorized === true
  const allowedSections: string[] = profile?.allowed_sections || []

  if (!isAdmin && !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-orange-800 hover:text-orange-950 mb-6">
          <Home className="w-4 h-4 mr-1.5" /> Ana Sayfaya Git
        </Link>
        <Card className="max-w-md w-full border-amber-200 bg-white text-center p-8 shadow-sm">
          <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Erişim Onayı Bekleniyor</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            Hesabınız henüz diyetisyeniniz tarafından onaylanmamış veya danışmanlık süreniz tamamlanmış olabilir.
          </p>
          <SignOutButton className="w-full justify-center" />
        </Card>
      </div>
    )
  }

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

  const { data: meetingRecords } = await supabase
    .from('meeting_records')
    .select('*')
    .order('created_at', { ascending: false })

  const groupedVideos: { [key: string]: any[] } = {}
  videos?.forEach((vid) => {
    const sec = vid.section || 'Genel Eğitimler'
    if (!groupedVideos[sec]) groupedVideos[sec] = []
    groupedVideos[sec].push(vid)
  })

  const accessibleSections = Object.keys(groupedVideos).filter(
    (secName) => isAdmin || allowedSections.includes(secName)
  )

  return (
    <div className="min-h-screen bg-stone-50/70 pb-20 relative">
      <header className="bg-white border-b border-orange-100 py-6 px-6 md:px-12 mb-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link href="/" className="inline-flex items-center text-xs font-semibold text-orange-700 hover:underline">
                <Home className="w-3.5 h-3.5 mr-1" /> msvebeslenme
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

      <main className="max-w-7xl mx-auto px-6 space-y-12">
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
                <Button size="lg" className="w-full md:w-auto bg-white text-orange-950 hover:bg-orange-50 font-bold px-8 py-6 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <VideoIcon className="w-5 h-5 mr-2 text-orange-600" /> Toplantıya Katıl
                </Button>
              </a>
            </div>
          </Card>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <History className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Geçmiş Toplantı Kayıtları</h2>
            <span className="text-xs text-muted-foreground font-medium ml-2">
              (Katılamadığınız toplantıları buradan izleyebilirsiniz)
            </span>
          </div>

          {meetingRecords && meetingRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetingRecords.map((rec) => (
                <Card key={rec.id} className="border-stone-200/80 shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between text-xs text-orange-700 font-bold mb-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {rec.record_date}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-stone-900 leading-snug">
                      {rec.title}
                    </CardTitle>
                    {rec.notes && (
                      <CardDescription className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {rec.notes}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <a href={rec.record_url} target="_blank" rel="noopener noreferrer" className="w-full block">
                      <Button variant="outline" size="sm" className="w-full border-orange-200 text-orange-800 hover:bg-orange-50 font-semibold cursor-pointer">
                        Kaydı İzle <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-500">
              Henüz arşivlenmiş bir toplantı kaydı bulunmuyor.
            </div>
          )}
        </section>

        <section className="space-y-6">
          {accessibleSections.length > 0 ? (
            accessibleSections.map((sectionName) => (
              <div key={sectionName} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Layers className="w-5 h-5 text-orange-600" />
                  <h2 className="text-xl font-bold text-stone-900 tracking-tight">{sectionName}</h2>
                  <span className="text-xs text-muted-foreground font-medium ml-2">({groupedVideos[sectionName].length} Video)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {groupedVideos[sectionName].map((vid, idx) => (
                    <Card key={vid.id} className="overflow-hidden border-stone-200/80 shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col">
                      <ProtectedVideoPlayer url={vid.youtube_url} title={vid.title} />

                      <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-orange-600 text-xs font-bold">
                            <PlayCircle className="w-4 h-4" /> Ders {vid.order || idx + 1}
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
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-200 max-w-lg mx-auto p-6 space-y-3">
              <Lock className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="text-lg font-bold text-stone-900">Henüz Açılmış Bir Eğitim Modülünüz Yok</h3>
              <p className="text-stone-500 text-xs leading-relaxed">
                Hesabınız onaylandı ancak henüz bir video partı tanımlanmadı. Diyetisyeninizle iletişime geçiniz.
              </p>
            </div>
          )}
        </section>

        <section className="pt-6 border-t border-stone-200 max-w-2xl mx-auto">
          {user && <DashboardReviewForm userId={user.id} />}
        </section>
      </main>

      {/* SAĞ ALTA SABİTLENMİŞ CANLI WHATSAPP BUTONU (Numaranızı 905XXXXXXXXX şeklinde güncelleyin) */}
      <FloatingWhatsApp phoneNumber="905000000000" />
    </div>
  )
}