'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  FileText, 
  Video, 
  Newspaper, 
  Home, 
  LogOut, 
  Trash2, 
  Eye, 
  X, 
  PlusCircle, 
  ExternalLink,
  Calendar
} from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const [activeMenu, setActiveMenu] = useState<'forms' | 'users' | 'videos' | 'posts' | 'meeting'>('forms')

  const [forms, setForms] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<any | null>(null)
  const [selectedForm, setSelectedForm] = useState<any | null>(null)
  const [meetingLoading, setMeetingLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: formData } = await supabase.from('forms').select('*').order('created_at', { ascending: false })
    const { data: userData } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    const { data: videoData } = await supabase.from('videos').select('*').order('order', { ascending: true })
    const { data: postData } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    const { data: meetingData } = await supabase.from('meetings').select('*').order('created_at', { ascending: false }).limit(1)

    if (formData) setForms(formData)
    if (userData) setUsers(userData)
    if (videoData) setVideos(videoData)
    if (postData) setPosts(postData)
    if (meetingData && meetingData.length > 0) setCurrentMeeting(meetingData[0])
  }

  async function toggleAuthorization(userId: string, currentStatus: boolean) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_authorized: !currentStatus } : u))
    
    const { error } = await supabase
      .from('users')
      .update({ is_authorized: !currentStatus })
      .eq('id', userId)

    if (error) {
      alert('Yetki güncellenirken hata: ' + error.message)
      fetchData()
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function handleAddVideo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    await supabase.from('videos').insert([{
      title: formData.get('title'),
      youtube_url: formData.get('youtube_url'),
      description: formData.get('description'),
      order: Number(formData.get('order')) || 0,
    }])

    form.reset()
    fetchData()
  }

  async function deleteVideo(id: string) {
    if (!confirm('Videoyu silmek istediğinize emin misiniz?')) return
    await supabase.from('videos').delete().eq('id', id)
    fetchData()
  }

  async function handleAddPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    await supabase.from('posts').insert([{
      title: formData.get('title'),
      content: formData.get('content'),
      image_url: formData.get('image_url') || null,
      link_url: formData.get('link_url') || null,
    }])

    form.reset()
    fetchData()
  }

  async function deletePost(id: string) {
    if (!confirm('Yazıyı silmek istediğinize emin misiniz?')) return
    await supabase.from('posts').delete().eq('id', id)
    fetchData()
  }

  async function handleSaveMeeting(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMeetingLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      title: formData.get('title'),
      meeting_url: formData.get('meeting_url'),
      meeting_date: formData.get('meeting_date'),
      notes: formData.get('notes'),
      is_active: true
    }

    const { error } = await supabase.from('meetings').insert([payload])
    setMeetingLoading(false)

    if (!error) {
      alert('Pazartesi toplantı bağlantısı başarıyla güncellendi!')
      fetchData()
    } else {
      alert('Toplantı kaydedilirken hata: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/60 flex flex-col md:flex-row">
      {/* Sol Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              MS
            </div>
            <div>
              <span className="font-extrabold text-stone-900 text-base leading-none block">msvebeslenme</span>
              <span className="text-[11px] text-muted-foreground font-medium">Yönetici Paneli</span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-2">
            <button
              onClick={() => { setActiveMenu('forms'); setSelectedForm(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeMenu === 'forms' ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" /> Başvurular
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[11px] px-1.5">
                {forms.length}
              </Badge>
            </button>

            <button
              onClick={() => { setActiveMenu('users'); setSelectedForm(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeMenu === 'users' ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" /> Danışanlar
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[11px] px-1.5">
                {users.length}
              </Badge>
            </button>

            <button
              onClick={() => { setActiveMenu('meeting'); setSelectedForm(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeMenu === 'meeting' ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-orange-600" /> Canlı Toplantı
              </div>
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            </button>

            <button
              onClick={() => { setActiveMenu('videos'); setSelectedForm(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeMenu === 'videos' ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4" /> Eğitim Videoları
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[11px] px-1.5">
                {videos.length}
              </Badge>
            </button>

            <button
              onClick={() => { setActiveMenu('posts'); setSelectedForm(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeMenu === 'posts' ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Newspaper className="w-4 h-4" /> Yazılar & Duyurular
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[11px] px-1.5">
                {posts.length}
              </Badge>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-100 space-y-2">
          <Link href="/" className="w-full">
            <Button variant="outline" size="sm" className="w-full justify-start text-stone-700 border-stone-200 hover:bg-orange-50 cursor-pointer">
              <Home className="w-4 h-4 mr-2 text-orange-600" /> Ana Sayfa
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="w-full justify-start text-stone-500 hover:text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" /> Güvenli Çıkış
          </Button>
        </div>
      </aside>

      {/* Sağ İçerik */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        {/* SEKME 1: BAŞVURULAR */}
        {activeMenu === 'forms' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">Gelen Başvurular</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className={selectedForm ? "lg:col-span-1" : "lg:col-span-3"}>
                <Card className="border-stone-200/80 shadow-xs bg-white">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Danışan</TableHead>
                          <TableHead className={selectedForm ? "hidden" : "table-cell"}>Telefon</TableHead>
                          <TableHead className={selectedForm ? "hidden" : "table-cell"}>Motivasyon</TableHead>
                          <TableHead className={selectedForm ? "hidden" : "table-cell"}>Tarih</TableHead>
                          <TableHead className="text-right">Detay</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {forms.map((f) => (
                          <TableRow key={f.id} className={selectedForm?.id === f.id ? "bg-orange-50/70" : ""}>
                            <TableCell className="font-semibold text-stone-900">
                              {f.fullname}
                              <span className="block text-xs text-muted-foreground font-normal">{f.phone}</span>
                            </TableCell>
                            <TableCell className={selectedForm ? "hidden" : "table-cell text-sm"}>{f.phone}</TableCell>
                            <TableCell className={selectedForm ? "hidden" : "table-cell"}>
                              <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                                {f.details?.motivation_score ? `${f.details.motivation_score}/10` : '-'}
                              </Badge>
                            </TableCell>
                            <TableCell className={selectedForm ? "hidden" : "table-cell text-xs text-muted-foreground"}>
                              {new Date(f.created_at).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" onClick={() => setSelectedForm(f)} className="text-orange-800 border-orange-200 hover:bg-orange-50 cursor-pointer">
                                <Eye className="w-3.5 h-3.5 mr-1" /> İncele
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {selectedForm && (
                <div className="lg:col-span-2">
                  <Card className="border-orange-200 shadow-sm bg-white sticky top-6">
                    <CardHeader className="border-b border-stone-100 flex flex-row items-center justify-between pb-3">
                      <div>
                        <CardTitle className="text-lg font-bold text-stone-900">{selectedForm.fullname}</CardTitle>
                        <span className="text-xs text-muted-foreground">Anket Yanıtları</span>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => setSelectedForm(null)} className="cursor-pointer">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-lg border border-stone-100">
                        <div><span className="text-muted-foreground">Telefon:</span> <strong>{selectedForm.phone}</strong></div>
                        <div><span className="text-muted-foreground">E-posta:</span> <strong>{selectedForm.email || '-'}</strong></div>
                        <div><span className="text-muted-foreground">Yaş / Meslek:</span> <strong>{selectedForm.details?.age || '-'} / {selectedForm.details?.job || '-'}</strong></div>
                        <div><span className="text-muted-foreground">Medeni / Çocuk:</span> <strong>{selectedForm.details?.marital_status} / {selectedForm.details?.has_child}</strong></div>
                      </div>

                      <div className="space-y-2">
                        <strong className="text-stone-900 block font-semibold">Teşhis & Hastalık:</strong>
                        <p className="bg-stone-50 p-2.5 rounded text-stone-700">{selectedForm.details?.diagnosis_and_type || '-'}</p>
                        <span className="text-muted-foreground block mt-1">Ek Hastalık: {selectedForm.details?.other_disease || 'Yok'}</span>
                        <span className="text-muted-foreground block">Hareket Durumu: {selectedForm.details?.mobility || '-'}</span>
                      </div>

                      <div className="space-y-1.5">
                        <strong className="text-stone-900 block font-semibold">Zorlayan Semptomlar:</strong>
                        <div className="flex flex-wrap gap-1">
                          {selectedForm.details?.symptoms?.map((s: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-orange-50 text-orange-900 border-orange-200 text-[11px] font-normal">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <strong className="text-stone-900 block font-semibold">Hedefler & Beklenti:</strong>
                        <p className="bg-stone-50 p-2.5 rounded text-stone-700 whitespace-pre-line">{selectedForm.details?.reason_and_expectation || selectedForm.message}</p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div><span className="text-muted-foreground">Motivasyon:</span> <Badge className="bg-orange-600 text-white ml-1">{selectedForm.details?.motivation_score || '-'}/10</Badge></div>
                          <div><span className="text-muted-foreground">Bütçe:</span> <span className="font-medium text-stone-800 ml-1">{selectedForm.details?.financial_status || '-'}</span></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEKME 2: DANIŞAN YÖNETİMİ & BELİRGİN SWITCH BUTONU */}
        {activeMenu === 'users' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Kayıtlı Danışanlar</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Danışanların video arşivine ve canlı toplantılara erişim onayını yönetin</p>
            </div>

            <Card className="border-stone-200/80 shadow-xs bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Erişim Durumu</TableHead>
                      <TableHead className="text-right">Yetkilendirme Butonu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="hover:bg-stone-50/50">
                        <TableCell className="font-semibold text-stone-900">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs font-normal">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.is_authorized ? (
                            <Badge className="bg-emerald-600 text-white text-xs font-medium">
                              Erişim Açık
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-stone-100 text-stone-500 text-xs font-medium">
                              Kilitli
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Switch
                              checked={u.is_authorized}
                              onCheckedChange={() => toggleAuthorization(u.id, u.is_authorized)}
                              className="cursor-pointer border-2 border-stone-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 data-[state=unchecked]:bg-stone-200"
                            />
                            <span className="text-xs font-medium text-stone-600 min-w-[70px] text-left">
                              {u.is_authorized ? 'Onaylı' : 'Onaysız'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SEKME 3: CANLI TOPLANTI (FieldControl Hatası Çözüldü) */}
        {activeMenu === 'meeting' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Pazartesi Canlı Grup Toplantısı</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Google Meet veya Zoom linkini buraya girin. Onaylı tüm danışanların panelinde görünür.
              </p>
            </div>

            <Card className="border-orange-200 shadow-xs bg-white max-w-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" /> Bu Haftanın Toplantı Bilgileri
                </CardTitle>
                <CardDescription>
                  Girdiğiniz link doğrudan onaylı danışanların paneline eklenir.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* key eklenerek defaultValue konsol uyarısı giderildi */}
                <form key={currentMeeting?.id || 'new-meeting'} onSubmit={handleSaveMeeting} className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Başlığı</Label>
                    <Input 
                      name="title" 
                      defaultValue={currentMeeting?.title || 'Pazartesi Canlı Grup Toplantısı'} 
                      required 
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Tarihi & Saati</Label>
                    <Input 
                      name="meeting_date" 
                      placeholder="Örn: Her Pazartesi 20:30" 
                      defaultValue={currentMeeting?.meeting_date || 'Her Pazartesi 20:30'} 
                      required 
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Linki (Google Meet veya Zoom)</Label>
                    <Input 
                      name="meeting_url" 
                      type="url" 
                      placeholder="https://meet.google.com/abc-defg-hij" 
                      defaultValue={currentMeeting?.meeting_url || ''} 
                      required 
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Notu / Danışana Mesaj</Label>
                    <Textarea 
                      name="notes" 
                      rows={2} 
                      placeholder="Örn: Bu hafta enflamasyon konusunu ele alacağız." 
                      defaultValue={currentMeeting?.notes || ''} 
                    />
                  </div>

                  <Button type="submit" disabled={meetingLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
                    {meetingLoading ? 'Kaydediliyor...' : 'Toplantı Linkini Güncelle & Panellerde Yayınla'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {currentMeeting && (
              <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 max-w-xl text-xs space-y-1.5">
                <span className="font-bold text-orange-950 block text-sm">Şu An Danışan Panelinde Görünen Aktif Toplantı:</span>
                <p><strong>Zaman:</strong> {currentMeeting.meeting_date}</p>
                <p><strong>Link:</strong> <a href={currentMeeting.meeting_url} target="_blank" className="text-orange-700 underline font-medium">{currentMeeting.meeting_url}</a></p>
                {currentMeeting.notes && <p><strong>Not:</strong> {currentMeeting.notes}</p>}
              </div>
            )}
          </div>
        )}

        {/* SEKME 4: VİDEO YÖNETİMİ */}
        {activeMenu === 'videos' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">Eğitim Videoları</h2>
            <Card className="border-stone-200/80 shadow-xs bg-white">
              <CardHeader><CardTitle className="text-base font-bold text-stone-900">Yeni Video Ekle</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddVideo} className="space-y-3 max-w-lg">
                  <Input name="title" placeholder="Video Başlığı" required />
                  <Input name="youtube_url" placeholder="YouTube Linki (Örn: https://www.youtube.com/watch?v=...)" required />
                  <Textarea name="description" placeholder="Açıklama veya danışana notlar" />
                  <Input name="order" type="number" placeholder="Sıralama (Örn: 1)" />
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer">Videoyu Kaydet</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 shadow-xs bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sıra</TableHead>
                      <TableHead>Başlık</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="w-16">{v.order}</TableCell>
                        <TableCell className="font-semibold text-stone-900">{v.title}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => deleteVideo(v.id)} className="cursor-pointer">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SEKME 5: YAZILAR & DUYURULAR */}
        {activeMenu === 'posts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">Yazılar & Duyurular</h2>
            <Card className="border-stone-200/80 shadow-xs bg-white">
              <CardHeader><CardTitle className="text-base font-bold text-stone-900">Yeni İçerik Yayınla</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddPost} className="space-y-3 max-w-xl">
                  <Input name="title" placeholder="Başlık (Örn: Yeni Instagram Videomuz Yayında!)" required />
                  <Textarea name="content" rows={3} placeholder="İçerik yazısı veya kısa özet..." required />
                  <Input name="image_url" placeholder="Görsel Linki (Örn: https://images.unsplash.com/...)" />
                  <Input name="link_url" placeholder="Instagram / Dış Bağlantı Linki" />
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
                    <PlusCircle className="w-4 h-4 mr-1.5" /> Ana Sayfada Yayınla
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="border-stone-200/80 shadow-xs bg-white flex flex-col justify-between overflow-hidden">
                  {post.image_url && (
                    <div className="h-44 w-full overflow-hidden bg-stone-100">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base mb-1">{post.title}</h3>
                      <p className="text-xs text-stone-600 line-clamp-3 mb-3">{post.content}</p>
                      {post.link_url && (
                        <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-semibold text-orange-600 hover:underline">
                          Bağlantıyı Aç <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-stone-100 mt-3">
                      <span className="text-[11px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                      <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} className="cursor-pointer">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}