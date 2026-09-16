import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SignOutButton } from '@/components/SignOutButton'
import { 
  ArrowRight, 
  Flame, 
  HeartPulse, 
  ShieldCheck, 
  Video, 
  CalendarCheck, 
  MessageCircle, 
  ExternalLink, 
  Newspaper,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react'

// Saf SVG Instagram İkonu
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

// YouTube linkinden embed url çıkarıcı
function getEmbedUrl(url: string | null) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null
}

export default async function LandingPage() {
  const supabase = await createClient()

  // Giriş Yapmış Kullanıcı Var mı ve Rolü Ne?
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

  // Adminin Eklediği Güncel Postları Çek
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="flex flex-col min-h-screen bg-stone-50/50 scroll-smooth">
      {/* 1. Navbar */}
      <header className="px-6 md:px-12 h-20 flex items-center justify-between border-b border-orange-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            MS
          </div>
          <span className="text-2xl font-extrabold text-orange-950 tracking-tight">
            msvebeslenme<span className="text-orange-600">.com</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
          <a href="#hakkimda" className="hover:text-orange-600 transition-colors">Ben Kimim?</a>
          <a href="#nasil-calisiyoruz" className="hover:text-orange-600 transition-colors">Nasıl Çalışıyoruz?</a>
          <a href="#yazilar" className="hover:text-orange-600 transition-colors">Yazılar & Duyurular</a>
          <a href="#iletisim" className="hover:text-orange-600 transition-colors">İletişim & Randevu</a>
        </nav>

        <div className="flex gap-2.5 items-center">
          {user ? (
            <>
              <Link href={userRole === 'admin' ? '/admin' : '/dashboard'}>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs md:text-sm">
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
                <Button variant="ghost" className="text-orange-950 hover:bg-orange-50 font-semibold text-xs md:text-sm">
                  Üye Girişi
                </Button>
              </Link>
              <Link href="/basvuru">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs md:text-sm shadow-sm shadow-orange-600/20">
                  Hemen Başvur
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. Hero */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white py-24 md:py-36 px-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-medium mb-8">
            <Flame className="w-4 h-4 text-amber-200 fill-amber-200" /> MS'le Yaşamda Beslenmenin Gücü
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.15]">
            Multipl Skleroz Yolculuğunda <br />
            <span className="text-amber-200 underline decoration-amber-300/60 decoration-wavy">Yalnız Değilsiniz.</span>
          </h1>

          <p className="text-lg md:text-2xl text-orange-50/90 max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
            Katı yasaklar ve stresli listeler yerine; bilimsel, anti-enflamatuar ve bizzat MS tecrübesiyle şekillenmiş sürdürülebilir beslenme rehberliği.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/basvuru">
              <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-orange-50 text-orange-950 font-bold text-base px-9 py-6 rounded-xl shadow-xl hover:scale-105 transition-all cursor-pointer">
                Danışmanlık İçin Başvur <ArrowRight className="ml-2 w-5 h-5 text-orange-600" />
              </Button>
            </Link>
            <Link href={user ? (userRole === 'admin' ? '/admin' : '/dashboard') : '/login'}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-semibold text-base px-8 py-6 rounded-xl cursor-pointer">
                {user ? 'Panelime Doğrudan Git' : 'Danışan Paneline Giriş'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Hakkımda */}
      <section id="hakkimda" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-orange-600 font-bold tracking-wider uppercase text-xs bg-orange-100/60 px-3 py-1 rounded-full">
              Hikayem
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight">
              Sizi ve Yaşadıklarınızı Gerçekten Anlayan Bir Diyetisyen
            </h2>
            <p className="text-stone-700 leading-relaxed">
              Ben <strong>Diyetisyen Sümeyye Can</strong>. Uzun zamandır sadece MS hastalarıyla çalışan ve bizzat bu süreci yaşayan bir diyetisyenim.
            </p>
            <p className="text-stone-700 leading-relaxed">
              Yorgunluğu, alevlenmeleri, besinlerin vücutta yarattığı enflamatuar etkileri teorik bir kitaptan değil; hem bilimsel uzmanlığımdan hem de kendi yaşamımdan biliyorum.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-stone-900 mb-2 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-orange-600" /> Bu Programda Neler Var?
            </h3>
            <div className="space-y-3 text-sm text-stone-700">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <span>Anti-enflamatuar beslenme ve mikrobiyota odaklı yaklaşım</span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <span>Haftalık grup toplantıları ve kalıcı alışkanlık takibi</span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <span>Video Arşiv Portalı (Panel üzerinden sürekli erişim)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Nasıl Çalışıyoruz? */}
      <section id="nasil-calisiyoruz" className="py-20 bg-orange-50/50 border-y border-orange-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-orange-600 font-bold uppercase text-xs tracking-wider">Adım Adım</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mt-2">Nasıl Çalışıyoruz?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Başvuru Formu', desc: 'MS anketini doldurarak mevcut semptomlarınızı ve durumunuzu iletin.', icon: CalendarCheck },
              { step: '2', title: 'WhatsApp Dönüşü', desc: 'Formunuz incelenerek 1 hafta içinde detaylı ön görüşme için iletişime geçilir.', icon: MessageCircle },
              { step: '3', title: 'Program & Topluluk', desc: '6 aylık grup çalışması, toplantılar ve beslenme protokolü başlar.', icon: ShieldCheck },
              { step: '4', title: 'Panel Erişimi', desc: 'Hesabınız onaylanır ve video eğitim platformuna erişiminiz açılır.', icon: Video },
            ].map((item, idx) => (
              <Card key={idx} className="border-orange-100 shadow-none hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-700 font-extrabold text-lg rounded-2xl flex items-center justify-center mx-auto mb-4">
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

      {/* 5. Güncel Yazılar & Duyurular (Saf SVG Instagram ile) */}
      <section id="yazilar" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-orange-600 font-bold uppercase text-xs tracking-wider inline-flex items-center gap-1.5 bg-orange-100/60 px-3 py-1 rounded-full">
            <Newspaper className="w-3.5 h-3.5" /> Blog & Sosyal Medya
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mt-3">Güncel Yazılar & Duyurular</h2>
          <p className="text-sm text-stone-600 mt-2">Diyetisyen Sümeyye Can'dan son paylaşımlar, bilgilendirmeler ve videolar</p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => {
              const youtubeEmbed = getEmbedUrl(post.link_url)
              const isInstagram = post.link_url && post.link_url.includes('instagram.com')

              return (
                <Card key={post.id} className="overflow-hidden border-orange-100 shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
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
                      <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider block mb-1">
                        {new Date(post.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <h3 className="text-lg font-bold text-stone-900 mb-2">{post.title}</h3>
                      <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {post.link_url && (
                      <a
                        href={post.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline pt-2 border-t border-stone-100"
                      >
                        {isInstagram ? 'Instagram\'da İzle' : 'Bağlantıyı Aç'} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-orange-200">
            <p className="text-stone-500 text-sm">Yakında yeni makale ve duyurular burada paylaşılacaktır.</p>
          </div>
        )}
      </section>

      {/* 6. İletişim */}
      <section id="iletisim" className="py-20 max-w-4xl mx-auto px-6 text-center">
        <div className="bg-white p-10 md:p-12 rounded-3xl border border-orange-200 shadow-sm space-y-6">
          <h2 className="text-3xl font-extrabold text-stone-900">İletişim & Randevu Süreci</h2>
          <p className="text-stone-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Programa kabul için öncelikle durumunuzu detaylıca değerlendireceğimiz başvuru formunu doldurmanız gerekmektedir. Formu ilettikten sonra randevu ve bilgilendirme için sizinle iletişime geçeceğim.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href="/basvuru">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-xl cursor-pointer">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-8 px-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-bold text-orange-950 text-sm">msvebeslenme.com</span>
          <p>© {new Date().getFullYear()} Diyetisyen Sümeyye Can. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href={user ? (userRole === 'admin' ? '/admin' : '/dashboard') : '/login'} className="hover:text-orange-600">
              {user ? 'Panelim' : 'Danışan Girişi'}
            </Link>
            <Link href="/basvuru" className="hover:text-orange-600">Başvuru</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}