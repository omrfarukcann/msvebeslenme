'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 } from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const [forms, setForms] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: formData } = await supabase.from('forms').select('*').order('created_at', { ascending: false })
    const { data: userData } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    const { data: videoData } = await supabase.from('videos').select('*').order('order', { ascending: true })

    if (formData) setForms(formData)
    if (userData) setUsers(userData)
    if (videoData) setVideos(videoData)
  }

  async function toggleAuthorization(userId: string, currentStatus: boolean) {
    await supabase.from('users').update({ is_authorized: !currentStatus }).eq('id', userId)
    fetchData()
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-emerald-950 mb-6">Yönetim Paneli</h1>

      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forms">Başvurular ({forms.length})</TabsTrigger>
          <TabsTrigger value="users">Danışan Yönetimi ({users.length})</TabsTrigger>
          <TabsTrigger value="videos">Video İçerikleri ({videos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="forms">
          <Card>
            <CardHeader><CardTitle>Gelen Danışan Başvuruları</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Mesaj / Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.fullname}</TableCell>
                      <TableCell>{f.phone}<br/><span className="text-xs text-muted-foreground">{f.email}</span></TableCell>
                      <TableCell className="max-w-md truncate">{f.message}</TableCell>
                      <TableCell>{new Date(f.created_at).toLocaleDateString('tr-TR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>Kayıtlı Kullanıcılar ve Erişim Onayı</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>İçerik Erişimi (Yetki)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={u.is_authorized}
                            onCheckedChange={() => toggleAuthorization(u.id, u.is_authorized)}
                          />
                          <span className="text-xs">{u.is_authorized ? 'Erişim Açık' : 'Kilitli'}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Yeni Eğitim Videosu Ekle</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddVideo} className="space-y-3 max-w-lg">
                <Input name="title" placeholder="Video Başlığı" required />
                <Input name="youtube_url" placeholder="YouTube Video Linki (Örn: https://www.youtube.com/watch?v=...)" required />
                <Textarea name="description" placeholder="Açıklama veya video notları" />
                <Input name="order" type="number" placeholder="Sıralama (Opsiyonel, örn: 1)" />
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white">Videoyu Kaydet</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Mevcut Videolar</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.order}</TableCell>
                      <TableCell className="font-medium">{v.title}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteVideo(v.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}