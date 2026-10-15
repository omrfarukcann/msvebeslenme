import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SignOutButton } from '@/components/SignOutButton'
import { maskName } from '@/lib/utils'
import { 
  ArrowRight, 
  HeartPulse, 
  ShieldCheck, 
  Video, 
  CalendarCheck, 
  MessageCircle, 
  ExternalLink, 
  Newspaper,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  Brain,
  Star,
  Quote
} from 'lucide-react'

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function getEmbedUrl(url: string | null) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null
}

export default async function LandingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  let userRole: 'admin' | 'user' | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role || 'user'
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="flex flex-col min-h-screen bg-stone-50/60 scroll-smooth selection:bg-orange-500 selection:text-white">
      <header className="px-6 md:px-12 h-20 flex items-center justify-between border-b border-orange-100/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:bg-orange-700 transition-colors">
            MS
          </div>
          <span className="text-2xl font-black text-stone-900 tracking-tight">
            msvebeslenme
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-stone-700">
          <a href="#hakkimda" className="px-3 py-2 rounded-xl transition-all hover:bg-orange-100/70 hover:text-orange-700">Ben Kimim?</a>
          <a href="#nasil-calisiyoruz" className="px-3 py-2 rounded-xl transition-all hover:bg-orange-100/70 hover:text-orange-700">Nasıl Çalışıyoruz?</a>
          <a href="#yorumlar" className="px-3 py-2 rounded-xl transition-all hover:bg-orange-100/70 hover:text-orange-700">Danışan Yorumları</a>
          <a href="#yazilar" className="px-3 py-2 rounded-xl transition-all hover:bg-orange-100/70 hover:text-orange-700">Yazılar & Duyurular</a>
          <a href="#iletisim" className="px-3 py-2 rounded-xl transition-all hover:bg-orange-100/70 hover:text-orange-700">İletişim</a>
        </nav>

        <div className="flex gap-2.5 items-center">
          {user ? (
            <>
              <Link href={userRole === 'admin' ? '/admin' : '/dashboard'}>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs md:text-sm shadow-xs cursor-pointer">
                  {userRole === 'admin' ? (
                    <><ShieldAlert className="w-4 h-4 mr-1.5" /> Yönetim Paneli</>
                  ) : (
                    <><LayoutDashboard className="w-4 h-4 mr-1.5" /> Danışan Panelim</>
                  )}
                </Button>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-stone-800 hover:text-orange-600 hover:bg-orange-50 font-semibold text-xs md:text-sm cursor-pointer">
                  Üye Girişi
                </Button>
              </Link>
              <Link href="/basvuru">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs md:text-sm shadow-sm shadow-orange-600/20 cursor-pointer">
                  Hemen Başvur
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-orange-100/50 via-stone-50/30 to-transparent py-16 md:py-24 px-6 md:px-12 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-900 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-600" /> 
              Diyetisyen Sümeyye Can ile Bütüncül Yaklaşım
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.18]">
              Multipl Skleroz Yolculuğunda <br className="hidden sm:inline" />
              <span className="text-orange-600">Yasaklar Değil,</span> Şifa Veren Alışkanlıklar.
            </h1>

            <p className="text-base md:text-lg text-stone-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Katı diyet listelerinin yarattığı stresi bir kenara bırakın. Bizzat MS tecrübesi ve bilimsel beslenme ilkeleriyle şekillenen; inflamasyonu sakinleştiren, enerjinizi yükselten ve sürdürülebilir bir beslenme düzenini adım adım birlikte kuruyoruz.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-1 text-xs font-semibold text-stone-700">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200/80 shadow-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Bizzat MS Tecrübesi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200/80 shadow-xs">
                <Brain className="w-4 h-4 text-orange-600" /> Bağırsak-Beyin Ekseni
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5 pt-4">
              <Link href="/basvuru">
                <Button size="lg" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-orange-600/25 hover:scale-[1.02] transition-all cursor-pointer">
                  Danışmanlık İçin Başvur <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a 
                href="https://www.instagram.com/msvebeslenme/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-stone-300 bg-white hover:bg-orange-50/70 text-stone-800 font-bold text-base px-7 py-6 rounded-xl cursor-pointer">
                  <InstagramIcon className="w-5 h-5 mr-2 text-pink-600" /> Instagram'da Takip Et
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-orange-100">
              <img
                src="/hero-sumeyye.png"
                alt="Diyetisyen Sümeyye Can - MS ve Beslenme"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-orange-100 text-center">
                <p className="font-extrabold text-orange-950 text-sm">"MS ile Sağlıklı Yaşam"</p>
                <span className="text-[11px] text-stone-500 font-medium">Bütüncül & Anti-Enflamatuar Beslenme</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="hakkimda" className="scroll-mt-28 py-20 md:py-28 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-orange-700 font-bold tracking-wider uppercase text-xs bg-orange-100/70 px-3 py-1 rounded-full inline-block">
              Ben Kimim?
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight">
              Sizi ve Yaşadıklarınızı Gerçekten Anlayan Bir Diyetisyen
            </h2>
            <p className="text-stone-700 leading-relaxed">
              Merhaba, ben <strong>Diyetisyen Sümeyye Can</strong>. Uzun zamandır sadece MS hastalarıyla çalışan ve bizzat bu süreçten geçen MS'li bir diyetisyenim.
            </p>
            <p className="text-stone-700 leading-relaxed">
              Alevlenmeleri, sabah kalkınca hissedilen derin yorgunluğu, bağırsak problemlerini ve kaygıları biliyorum. Amacım sizi katı yasaklarla strese sokmak değil; bilimsel ve adım adım sürdürülebilir sağlıklı alışkanlıklarla <strong>yaşam kalitenizi en üst seviyeye çıkarmak</strong>.
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl border border-orange-200/80 shadow-sm space-y-6">
            <h3 className="font-bold text-xl text-stone-900 flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <HeartPulse className="w-6 h-6 text-orange-600" /> Bu Programda Neler Var?
            </h3>
            <div className="space-y-4 text-sm font-medium text-stone-700">
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <span>Anti-enflamatuar beslenme ve mikrobiyota odaklı yaklaşım</span>
              </div>
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <span>Haftalık grup toplantıları ve kalıcı alışkanlık takibi</span>
              </div>
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <span>Video Arşiv Portalı (Panel üzerinden sürekli erişim)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="nasil-calisiyoruz" className="scroll-mt-28 py-20 md:py-24 bg-orange-50/50 border-y border-orange-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-orange-700 font-bold uppercase text-xs tracking-wider bg-orange-100 px-3 py-1 rounded-full">
              Süreç Nasıl İlerliyor?
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 mt-3">Nasıl Çalışıyoruz?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Başvuru Formu', desc: 'MS anketini doldurarak mevcut semptomlarınızı ve durumunuzu iletin.', icon: CalendarCheck },
              { step: '2', title: 'WhatsApp Dönüşü', desc: 'Formunuz incelenerek 1 hafta içinde detaylı ön görüşme için iletişime geçilir.', icon: MessageCircle },
              { step: '3', title: 'Program & Topluluk', desc: '6 aylık grup çalışması, canlı toplantılar ve beslenme protokolü başlar.', icon: ShieldCheck },
              { step: '4', title: 'Panel Erişimi', desc: 'Hesabınız onaylanır ve partlara ayrılmış video arşivine erişiminiz açılır.', icon: Video },
            ].map((item, idx) => (
              <Card key={idx} className="border-stone-200/80 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-700 font-black text-lg rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="yorumlar" className="scroll-mt-28 py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-orange-700 font-bold uppercase text-xs tracking-wider inline-flex items-center gap-1.5 bg-orange-100 px-3.5 py-1 rounded-full">
            <Quote className="w-3.5 h-3.5 text-orange-600" /> Gerçek Deneyimler
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 mt-3">Danışanlarımızın Deneyimleri</h2>
          <p className="text-sm text-stone-600 mt-2">Program sürecinde yaşam kalitesi artan ve şifa bulan danışanlarımızın yorumları</p>
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <Card key={rev.id} className="border-stone-200/80 shadow-xs hover:shadow-md transition-shadow bg-white p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-stone-700 italic leading-relaxed whitespace-pre-line">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">
                    {maskName(rev.fullname)}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Aktif Danışan
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-200 max-w-md mx-auto">
            <p className="text-stone-500 text-xs">Danışan deneyimleri yakında burada sergilenecektir.</p>
          </div>
        )}
      </section>

      <section id="yazilar" className="scroll-mt-28 py-20 px-6 max-w-6xl mx-auto border-t border-stone-200/60">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-orange-700 font-bold uppercase text-xs tracking-wider inline-flex items-center gap-1.5 bg-orange-100 px-3 py-1 rounded-full">
            <Newspaper className="w-3.5 h-3.5 text-orange-600" /> Blog & Sosyal Medya
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 mt-3">Güncel Yazılar & Duyurular</h2>
          <p className="text-sm text-stone-600 mt-2">Diyetisyen Sümeyye Can'dan son paylaşımlar ve videolar</p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => {
              const youtubeEmbed = getEmbedUrl(post.link_url)
              const isInstagram = post.link_url && post.link_url.includes('instagram.com')

              return (
                <Card key={post.id} className="overflow-hidden border-stone-200/80 shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col justify-between rounded-2xl">
                  {youtubeEmbed ? (
                    <div className="aspect-video w-full bg-stone-900">
                      <iframe
                        src={youtubeEmbed}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={post.title}
                      />
                    </div>
                  ) : post.image_url ? (
                    <div className="h-48 w-full overflow-hidden bg-stone-100 relative">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      {isInstagram && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full text-pink-600 shadow-sm">
                          <InstagramIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ) : null}

                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block mb-1">
                        {new Date(post.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 mb-2 leading-snug">{post.title}</h3>
                      <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {post.link_url && (
                      <a
                        href={post.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline pt-3 border-t border-stone-100"
                      >
                        {isInstagram ? 'Instagram\'da İncele' : 'Bağlantıyı Aç'} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-200">
            <p className="text-stone-500 text-sm">Yakında yeni makale ve duyurular burada paylaşılacaktır.</p>
          </div>
        )}
      </section>

      <section id="iletisim" className="scroll-mt-28 py-20 max-w-4xl mx-auto px-6 text-center">
        <div className="bg-white p-10 md:p-14 rounded-3xl border border-orange-200 shadow-sm space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-stone-900">İletişim & Randevu Süreci</h2>
          <p className="text-stone-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Programa kabul için öncelikle durumunuzu değerlendireceğimiz detaylı formu doldurmanız gerekmektedir. Formu ilettikten sonra randevu ve bilgilendirme için sizinle iletişime geçeceğim.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link href="/basvuru">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-xl cursor-pointer shadow-md">
                Başvuru Formunu Doldur
              </Button>
            </Link>
            <Link href={user ? (userRole === 'admin' ? '/admin' : '/dashboard') : '/login'}>
              <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 hover:bg-orange-50 px-8 py-6 rounded-xl cursor-pointer">
                {user ? 'Panelime Dön' : 'Zaten Danışanım (Giriş Yap)'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-stone-200 bg-white py-8 px-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-extrabold text-stone-900 text-sm">msvebeslenme</span>
          <p>© {new Date().getFullYear()} Diyetisyen Sümeyye Can. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href={user ? (userRole === 'admin' ? '/admin' : '/dashboard') : '/login'} className="hover:text-orange-600 font-medium">
              {user ? 'Panelim' : 'Danışan Girişi'}
            </Link>
            <Link href="/basvuru" className="hover:text-orange-600 font-medium">Başvuru</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}