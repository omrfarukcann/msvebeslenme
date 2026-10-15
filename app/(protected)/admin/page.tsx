'use client'

import { useEffect, useState, useMemo } from 'react'
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
import { maskName } from '@/lib/utils'
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
  Calendar, 
  Image as ImageIcon, 
  Edit2, 
  Layers, 
  Settings2, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle,
  History,
  MessageSquareHeart,
  Star,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter
} from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const [activeMenu, setActiveMenu] = useState<'forms' | 'users' | 'finance' | 'videos' | 'posts' | 'meeting' | 'records' | 'reviews'>('forms')

  const [forms, setForms] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<any | null>(null)
  const [meetingRecords, setMeetingRecords] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  
  const [selectedForm, setSelectedForm] = useState<any | null>(null)
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [editingVideo, setEditingVideo] = useState<any | null>(null)

  // Video Formu Controlled State'leri
  const [videoTitle, setVideoTitle] = useState('')
  const [videoSection, setVideoSection] = useState('1. Hafta (Part 1)')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDesc, setVideoDesc] = useState('')
  const [videoOrder, setVideoOrder] = useState<number>(1)

  // Part İzinleri Modal
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<any | null>(null)
  const [userPerms, setUserPerms] = useState<string[]>([])
  const [permsSaving, setPermsSaving] = useState(false)

  // Bölüm Adı Değiştirme Modal
  const [renamingSection, setRenamingSection] = useState<string | null>(null)
  const [newSectionName, setNewSectionName] = useState('')
  const [renameLoading, setRenameLoading] = useState(false)

  // Finans Form State'leri
  const [txType, setTxType] = useState<'income' | 'expense'>('income')
  const [txUserId, setTxUserId] = useState<string>('')
  const [txClientName, setTxClientName] = useState<string>('')
  const [txPaymentMethod, setTxPaymentMethod] = useState<string>('Havale / EFT')
  const [txPaymentStatus, setTxPaymentStatus] = useState<string>('Peşin / Tamamlandı')
  const [txLoading, setTxLoading] = useState(false)

  // Finans Filtreleri
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'this_year'>('this_month')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')

  const [meetingLoading, setMeetingLoading] = useState(false)
  const [postLoading, setPostLoading] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [recordLoading, setRecordLoading] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: formData } = await supabase.from('forms').select('*').order('created_at', { ascending: false })
    const { data: userData } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    const { data: videoData } = await supabase.from('videos').select('*').order('order', { ascending: true })
    const { data: postData } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    const { data: meetingData } = await supabase.from('meetings').select('*').order('created_at', { ascending: false }).limit(1)
    const { data: recData } = await supabase.from('meeting_records').select('*').order('created_at', { ascending: false })
    const { data: reviewData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    const { data: txData } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false })

    if (formData) setForms(formData)
    if (userData) setUsers(userData)
    if (videoData) setVideos(videoData)
    if (postData) setPosts(postData)
    if (meetingData && meetingData.length > 0) setCurrentMeeting(meetingData[0])
    if (recData) setMeetingRecords(recData)
    if (reviewData) setReviews(reviewData)
    if (txData) setTransactions(txData)
  }

  const allAvailableSections = Array.from(
    new Set(videos.map(v => (v.section || 'Genel Eğitimler').trim()))
  )

  // GENEL DANIŞAN STATÜSÜ
  async function toggleGeneralAuthorization(userId: string, currentStatus: boolean) {
    const newStatus = !currentStatus
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_authorized: newStatus } : u))

    const { error } = await supabase
      .from('users')
      .update({ is_authorized: newStatus })
      .eq('id', userId)

    if (error) {
      alert('Yetki güncellenirken hata: ' + error.message)
      fetchData()
    }
  }

  // PART İZİNLERİ
  function openPermsModal(user: any) {
    setSelectedUserForPerms(user)
    setUserPerms(user.allowed_sections || [])
  }

  function toggleSectionPerm(sectionName: string) {
    setUserPerms(prev => 
      prev.includes(sectionName) ? prev.filter(s => s !== sectionName) : [...prev, sectionName]
    )
  }

  async function saveUserPermissions() {
    if (!selectedUserForPerms) return
    setPermsSaving(true)

    const { error } = await supabase
      .from('users')
      .update({ allowed_sections: userPerms })
      .eq('id', selectedUserForPerms.id)

    setPermsSaving(false)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === selectedUserForPerms.id ? { ...u, allowed_sections: userPerms } : u))
      setSelectedUserForPerms(null)
    } else {
      alert('İzin kaydedilirken hata: ' + error.message)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // FİNANS: YENİ GELİR / GİDER EKLEME
  async function handleAddTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTxLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    let finalClientName = txClientName
    if (txUserId) {
      const foundUser = users.find(u => u.id === txUserId)
      if (foundUser) finalClientName = foundUser.email
    }

    const payload = {
      type: txType,
      amount: Number(formData.get('amount')),
      user_id: txUserId || null,
      client_name: finalClientName || (txType === 'expense' ? 'Gider' : 'Belirtilmedi'),
      payment_method: txPaymentMethod,
      payment_status: txPaymentStatus,
      category: (formData.get('category') as string) || (txType === 'income' ? 'Danışmanlık Ücreti' : 'Genel Gider'),
      description: formData.get('description') as string,
      transaction_date: (formData.get('transaction_date') as string) || new Date().toISOString().split('T')[0]
    }

    const { error } = await supabase.from('transactions').insert([payload])
    setTxLoading(false)

    if (!error) {
      form.reset()
      setTxClientName('')
      setTxUserId('')
      fetchData()
    } else {
      alert('İşlem kaydedilirken hata: ' + error.message)
    }
  }

  async function deleteTransaction(id: string) {
    if (!confirm('Bu finans kaydını silmek istediğinize emin misiniz?')) return
    await supabase.from('transactions').delete().eq('id', id)
    fetchData()
  }

  // FİNANS FİLTRELEME & TOPLAMLAR HESAPLAMA (useMemo)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const txDate = new Date(t.transaction_date)
      const now = new Date()

      // Tarih Filtresi
      if (dateFilter === 'this_month') {
        const isThisMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
        if (!isThisMonth) return false
      } else if (dateFilter === 'this_year') {
        const isThisYear = txDate.getFullYear() === now.getFullYear()
        if (!isThisYear) return false
      }

      // Tür Filtresi
      if (typeFilter !== 'all' && t.type !== typeFilter) return false

      // Ödeme Yöntemi Filtresi
      if (methodFilter !== 'all' && t.payment_method !== methodFilter) return false

      return true
    })
  }, [transactions, dateFilter, typeFilter, methodFilter])

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  }, [filteredTransactions])

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  }, [filteredTransactions])

  const netBalance = totalIncome - totalExpense

  // VİDEO DÜZENLEME & SIRA YÖNETİMİ
  function startEditVideo(video: any) {
    setEditingVideo(video)
    setVideoTitle(video.title || '')
    setVideoSection(video.section || 'Genel Eğitimler')
    setVideoUrl(video.youtube_url || '')
    setVideoDesc(video.description || '')
    setVideoOrder(Number(video.order) || 1)
    setVideoError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditVideo() {
    setEditingVideo(null)
    setVideoTitle('')
    setVideoSection('1. Hafta (Part 1)')
    setVideoUrl('')
    setVideoDesc('')
    setVideoOrder(1)
    setVideoError(null)
  }

  async function handleSaveVideo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setVideoError(null)
    setVideoLoading(true)

    const targetSection = videoSection.trim() || 'Genel Eğitimler'
    const targetOrder = Number(videoOrder) || 1

    const duplicate = videos.find(v => 
      (v.section || 'Genel Eğitimler').trim().toLowerCase() === targetSection.toLowerCase() &&
      Number(v.order) === targetOrder &&
      (!editingVideo || v.id !== editingVideo.id)
    )

    if (duplicate) {
      setVideoError(`"${targetSection}" bölümünde ${targetOrder} numaralı sıra zaten "${duplicate.title}" videosu tarafından kullanılıyor!`)
      setVideoLoading(false)
      return
    }

    const payload = {
      title: videoTitle.trim(),
      youtube_url: videoUrl.trim(),
      description: videoDesc.trim(),
      section: targetSection,
      order: targetOrder,
    }

    if (editingVideo) {
      await supabase.from('videos').update(payload).eq('id', editingVideo.id)
      cancelEditVideo()
    } else {
      await supabase.from('videos').insert([payload])
      setVideoTitle('')
      setVideoUrl('')
      setVideoDesc('')
      setVideoOrder(targetOrder + 1)
    }

    setVideoLoading(false)
    fetchData()
  }

  function openRenameSectionModal(oldName: string) {
    setRenamingSection(oldName)
    setNewSectionName(oldName)
  }

  async function handleRenameSectionSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!renamingSection) return

    const trimmedNewName = newSectionName.trim()
    if (!trimmedNewName || trimmedNewName === renamingSection) {
      setRenamingSection(null)
      return
    }

    setRenameLoading(true)

    const { error: videoUpdateError } = await supabase
      .from('videos')
      .update({ section: trimmedNewName })
      .eq('section', renamingSection)

    if (videoUpdateError) {
      alert('Videolar güncellenirken hata: ' + videoUpdateError.message)
      setRenameLoading(false)
      return
    }

    for (const u of users) {
      const allowed: string[] = u.allowed_sections || []
      if (allowed.includes(renamingSection)) {
        const updatedSections = allowed.map(s => s === renamingSection ? trimmedNewName : s)
        await supabase
          .from('users')
          .update({ allowed_sections: updatedSections })
          .eq('id', u.id)
      }
    }

    setRenameLoading(false)
    setRenamingSection(null)
    fetchData()
  }

  async function moveVideoOrder(video: any, direction: 'up' | 'down') {
    const currentSec = (video.section || 'Genel Eğitimler').trim()
    const sectionVideos = videos
      .filter(v => (v.section || 'Genel Eğitimler').trim() === currentSec)
      .sort((a, b) => a.order - b.order)

    const currentIndex = sectionVideos.findIndex(v => v.id === video.id)
    if (currentIndex === -1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sectionVideos.length) return

    const targetVideo = sectionVideos[targetIndex]
    const oldOrder = video.order
    const newOrder = targetVideo.order

    await supabase.from('videos').update({ order: newOrder }).eq('id', video.id)
    await supabase.from('videos').update({ order: oldOrder }).eq('id', targetVideo.id)

    fetchData()
  }

  async function deleteVideo(id: string) {
    if (!confirm('Videoyu silmek istediğinize emin misiniz?')) return
    await supabase.from('videos').delete().eq('id', id)
    if (editingVideo?.id === id) cancelEditVideo()
    fetchData()
  }

  // TOPLANTI KAYDI
  async function handleAddMeetingRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setRecordLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      title: formData.get('title') as string,
      record_date: formData.get('record_date') as string,
      record_url: formData.get('record_url') as string,
      notes: formData.get('notes') as string
    }

    const { error } = await supabase.from('meeting_records').insert([payload])
    setRecordLoading(false)

    if (!error) {
      form.reset()
      fetchData()
    } else {
      alert('Toplantı kaydı eklenirken hata: ' + error.message)
    }
  }

  async function deleteMeetingRecord(id: string) {
    if (!confirm('Bu toplantı kaydını silmek istediğinize emin misiniz?')) return
    await supabase.from('meeting_records').delete().eq('id', id)
    fetchData()
  }

  // YORUMLAR
  async function toggleReviewApproval(reviewId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: !currentStatus })
      .eq('id', reviewId)

    if (!error) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: !currentStatus } : r))
    } else {
      alert('Yorum durumu güncellenirken hata: ' + error.message)
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Yorumu silmek istediğinize emin misiniz?')) return
    await supabase.from('reviews').delete().eq('id', id)
    fetchData()
  }

  // YAZILAR (POSTS)
  async function handleSavePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPostLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    let finalImageUrl = (formData.get('image_url') as string) || (editingPost?.image_url || null)
    const file = (formData.get('image_file') as File)

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file)

      if (uploadError) {
        alert('Görsel yüklenirken hata: ' + uploadError.message)
        setPostLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)

      finalImageUrl = urlData.publicUrl
    }

    if (editingPost) {
      await supabase
        .from('posts')
        .update({
          title: formData.get('title'),
          content: formData.get('content'),
          image_url: finalImageUrl,
          link_url: formData.get('link_url') || null,
        })
        .eq('id', editingPost.id)
      setEditingPost(null)
    } else {
      await supabase.from('posts').insert([{
        title: formData.get('title'),
        content: formData.get('content'),
        image_url: finalImageUrl,
        link_url: formData.get('link_url') || null,
      }])
    }

    form.reset()
    setPostLoading(false)
    fetchData()
  }

  async function deletePost(id: string) {
    if (!confirm('Yazıyı silmek istediğinize emin misiniz?')) return
    await supabase.from('posts').delete().eq('id', id)
    if (editingPost?.id === id) setEditingPost(null)
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

  const groupedVideosForAdmin: { [key: string]: any[] } = {}
  videos.forEach(v => {
    const sec = (v.section || 'Genel Eğitimler').trim()
    if (!groupedVideosForAdmin[sec]) groupedVideosForAdmin[sec] = []
    groupedVideosForAdmin[sec].push(v)
  })

  return (
    <div className="min-h-screen bg-stone-50/60 flex flex-col md:flex-row">
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

            {/* YENİ: FİNANS VE GELİR GİDER MENÜSÜ */}
            <button
              onClick={() => { setActiveMenu('finance'); setSelectedForm(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeMenu === 'finance' ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-orange-600" /> Finans & Gelir
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[11px] px-1.5">
                ₺
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
              onClick={() => { setActiveMenu('records'); setSelectedForm(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeMenu === 'records' ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4" /> Toplantı Kayıtları
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[11px] px-1.5">
                {meetingRecords.length}
              </Badge>
            </button>

            <button
              onClick={() => { setActiveMenu('reviews'); setSelectedForm(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeMenu === 'reviews' ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquareHeart className="w-4 h-4" /> Danışan Yorumları
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[11px] px-1.5">
                {reviews.filter(r => !r.is_approved).length > 0 ? `${reviews.filter(r => !r.is_approved).length} Yeni` : reviews.length}
              </Badge>
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
                        <X className="w-4 h-4 text-stone-500" />
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

        {/* SEKME 2: DANIŞAN YÖNETİMİ */}
        {activeMenu === 'users' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Kayıtlı Danışanlar & Yetkilendirme</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Genel Danışan Onayı kapalı olan kullanıcılar sisteme giremez.
              </p>
            </div>

            <Card className="border-stone-200/80 shadow-xs bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Danışan E-posta</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Genel Danışan Statüsü</TableHead>
                      <TableHead>Açık Partlar</TableHead>
                      <TableHead className="text-right">Part Yetkileri</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const perms: string[] = u.allowed_sections || []
                      const isAuth = u.is_authorized === true

                      return (
                        <TableRow key={u.id} className="hover:bg-stone-50/50">
                          <TableCell className="font-semibold text-stone-900">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-xs font-normal">
                              {u.role}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isAuth}
                                onCheckedChange={() => toggleGeneralAuthorization(u.id, isAuth)}
                                className="cursor-pointer border-2 border-stone-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 data-[state=unchecked]:bg-stone-200"
                              />
                              <span className={`text-xs font-semibold ${isAuth ? 'text-orange-700' : 'text-stone-400'}`}>
                                {isAuth ? 'Aktif Danışan' : 'Kapalı / Kilitli'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {!isAuth ? (
                              <Badge variant="secondary" className="bg-red-50 text-red-600 text-[11px] border border-red-100">
                                Genel Erişim Kapalı
                              </Badge>
                            ) : perms.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {perms.map((p, i) => (
                                  <Badge key={i} className="bg-orange-100 text-orange-900 border-orange-200 text-[11px] font-medium">
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <Badge variant="secondary" className="bg-stone-100 text-stone-500 text-[11px]">
                                Part Tanımlanmamış
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => openPermsModal(u)}
                              className="border-orange-200 text-orange-900 hover:bg-orange-50 text-xs cursor-pointer font-medium"
                            >
                              <Settings2 className="w-3.5 h-3.5 mr-1 text-orange-600" /> Part Seç
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* PART SEÇME MODAL */}
            {selectedUserForPerms && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <Card className="w-full max-w-lg bg-white shadow-2xl border-orange-200 animate-in fade-in zoom-in-95">
                  <CardHeader className="border-b border-stone-100 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-stone-900">Eğitim Partlarını Yönet</CardTitle>
                        <CardDescription className="text-xs text-orange-800 font-medium mt-0.5">
                          {selectedUserForPerms.email}
                        </CardDescription>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => setSelectedUserForPerms(null)} className="cursor-pointer">
                        <X className="w-4 h-4 text-stone-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-xs text-stone-600">
                      Danışanın ödeme planına göre açmak istediğiniz partları işaretleyin:
                    </p>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
                      {allAvailableSections.length > 0 ? (
                        allAvailableSections.map((sectionName) => (
                          <label 
                            key={sectionName} 
                            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                              userPerms.includes(sectionName) 
                                ? 'bg-orange-50/90 border-orange-400 text-orange-950 font-bold shadow-xs' 
                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100/80 font-normal'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox"
                                checked={userPerms.includes(sectionName)}
                                onChange={() => toggleSectionPerm(sectionName)}
                                className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                              />
                              <span className="text-xs">{sectionName}</span>
                            </div>
                            {userPerms.includes(sectionName) && (
                              <Badge className="bg-orange-600 text-white text-[10px] font-bold">Açık</Badge>
                            )}
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 italic">Henüz sisteme eklenmiş bir video ve bölüm bulunmuyor.</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setSelectedUserForPerms(null)} className="cursor-pointer">
                        Vazgeç
                      </Button>
                      <Button 
                        size="sm" 
                        disabled={permsSaving} 
                        onClick={saveUserPermissions} 
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer"
                      >
                        {permsSaving ? 'Kaydediliyor...' : <><Check className="w-4 h-4 mr-1" /> İzinleri Kaydet</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* SEKME 3: FİNANS, GELİR & GİDER TAKİBİ (YENİ) */}
        {activeMenu === 'finance' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Finans & Gelir Takip Masası</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Danışan ödemeleri, taksit takibi, giderler ve net kâr durumu
                </p>
              </div>
            </div>

            {/* 1. Özet İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border-emerald-200 bg-emerald-50/50 shadow-xs">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Filtrelenen Gelir</span>
                    <h3 className="text-2xl font-black text-emerald-950 mt-1">₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50 shadow-xs">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">Filtrelenen Gider</span>
                    <h3 className="text-2xl font-black text-red-950 mt-1">₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50 shadow-xs">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-orange-800 uppercase tracking-wider block">Net Kâr / Bakiye</span>
                    <h3 className="text-2xl font-black text-orange-950 mt-1">₺{netBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2. Yeni Gelir / Gider Ekleme Formu */}
            <Card className="border-stone-200/80 shadow-xs bg-white">
              <CardHeader className="pb-3 border-b border-stone-100">
                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-orange-600" /> Yeni Ödeme / Harcama Kaydı Gir
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  {/* Gelir mi Gider mi Butonları */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType('income')}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        txType === 'income' 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      + Danışan Geliri (Ödeme)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('expense')}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        txType === 'expense' 
                          ? 'bg-red-600 text-white shadow-xs' 
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      - Harcama / Gider (Bunny, Domain vb.)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-stone-800">Tutar (TL) *</Label>
                      <Input name="amount" type="number" step="0.01" min="0" placeholder="Örn: 2500" required />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-stone-800">İşlem Tarihi *</Label>
                      <Input name="transaction_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-stone-800">Kategori</Label>
                      <Input name="category" placeholder={txType === 'income' ? 'Danışmanlık 1. Ay' : 'Bunny.net CDN Faturası'} />
                    </div>
                  </div>

                  {txType === 'income' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 bg-orange-50/50 rounded-xl border border-orange-100">
                      <div>
                        <Label className="text-xs font-semibold text-stone-800">Kayıtlı Danışan Seç (Opsiyonel)</Label>
                        <select 
                          value={txUserId} 
                          onChange={(e) => setTxUserId(e.target.value)}
                          className="w-full mt-1 h-9 px-2 text-xs rounded-md border border-stone-300 bg-white focus:ring-1 focus:ring-orange-500 cursor-pointer"
                        >
                          <option value="">Danışan Seçiniz...</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.email}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-stone-800">Danışan Adı (Veya Manuel İsim)</Label>
                        <Input 
                          value={txClientName} 
                          onChange={(e) => setTxClientName(e.target.value)}
                          placeholder="Örn: Ahmet Yılmaz" 
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-stone-800">Ödeme Yöntemi</Label>
                        <select 
                          value={txPaymentMethod} 
                          onChange={(e) => setTxPaymentMethod(e.target.value)}
                          className="w-full mt-1 h-9 px-2 text-xs rounded-md border border-stone-300 bg-white focus:ring-1 focus:ring-orange-500 cursor-pointer"
                        >
                          <option value="Havale / EFT">Havale / EFT</option>
                          <option value="Kredi Kartı">Kredi Kartı</option>
                          <option value="Nakit">Nakit</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <Label className="text-xs font-semibold text-stone-800">Ödeme & Taksit Durumu</Label>
                        <select 
                          value={txPaymentStatus} 
                          onChange={(e) => setTxPaymentStatus(e.target.value)}
                          className="w-full mt-1 h-9 px-2 text-xs rounded-md border border-stone-300 bg-white focus:ring-1 focus:ring-orange-500 cursor-pointer"
                        >
                          <option value="Peşin / Tamamlandı">Peşin / Tamamı Ödendi</option>
                          <option value="1. Taksit">1. Taksit Ödendi</option>
                          <option value="2. Taksit">2. Taksit Ödendi</option>
                          <option value="3. Taksit">3. Taksit Ödendi</option>
                          <option value="Kalan Ödeme Bekleniyor">Kalan Ödeme Bekleniyor</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs font-semibold text-stone-800">Gider Yeri / Kime Ödendi?</Label>
                      <Input 
                        value={txClientName} 
                        onChange={(e) => setTxClientName(e.target.value)}
                        placeholder="Örn: Bunny.net, Hosting, Muhasebeci vb." 
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Açıklama / Özel Not</Label>
                    <Textarea name="description" rows={2} placeholder="Dekont no, ödeme notları veya taksit vadesi..." />
                  </div>

                  <Button type="submit" disabled={txLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
                    {txLoading ? 'Kaydediliyor...' : <><Check className="w-4 h-4 mr-1.5" /> İşlemi Kaydet</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 3. Filtreleme Çubuğu ve Tablo */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <Filter className="w-4 h-4 text-orange-600" /> Filtrele:
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {/* Tarih Filtresi */}
                  <select 
                    value={dateFilter} 
                    onChange={(e: any) => setDateFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs rounded-lg border border-stone-300 bg-white font-medium cursor-pointer"
                  >
                    <option value="this_month">Bu Ay</option>
                    <option value="this_year">Bu Yıl</option>
                    <option value="all">Tüm Zamanlar</option>
                  </select>

                  {/* Tür Filtresi */}
                  <select 
                    value={typeFilter} 
                    onChange={(e: any) => setTypeFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs rounded-lg border border-stone-300 bg-white font-medium cursor-pointer"
                  >
                    <option value="all">Tüm İşlemler</option>
                    <option value="income">Sadece Gelirler</option>
                    <option value="expense">Sadece Giderler</option>
                  </select>

                  {/* Yöntem Filtresi */}
                  <select 
                    value={methodFilter} 
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs rounded-lg border border-stone-300 bg-white font-medium cursor-pointer"
                  >
                    <option value="all">Tüm Yöntemler</option>
                    <option value="Havale / EFT">Havale / EFT</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Nakit">Nakit</option>
                  </select>
                </div>
              </div>

              {/* Finans Tablosu */}
              <Card className="border-stone-200/80 shadow-xs bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Danışan / Açıklama</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Ödeme Detayı</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead className="text-right">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                          <TableRow key={tx.id} className="hover:bg-stone-50/60">
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(tx.transaction_date).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-stone-900 block text-xs">{tx.client_name}</span>
                              {tx.description && (
                                <span className="text-[11px] text-muted-foreground block truncate max-w-xs">{tx.description}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[11px] font-normal">
                                {tx.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <span className="text-xs text-stone-700 block font-medium">{tx.payment_method}</span>
                                <Badge className={`text-[10px] font-medium ${
                                  tx.payment_status.includes('Peşin') 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}>
                                  {tx.payment_status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {tx.type === 'income' ? '+' : '-'}₺{Number(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => deleteTransaction(tx.id)} className="text-stone-400 hover:text-red-600 h-8 w-8 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-stone-400 text-xs italic">
                            Seçilen filtrelere uygun finans kaydı bulunamadı.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* SEKME 4: CANLI TOPLANTI */}
        {activeMenu === 'meeting' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Pazartesi Canlı Grup Toplantısı</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Google Meet veya Zoom linkini buraya girin. Yalnızca onaylı aktif danışanlar görür.</p>
            </div>

            <Card className="border-orange-200 shadow-xs bg-white max-w-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" /> Bu Haftanın Toplantı Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form key={currentMeeting?.id || 'new-meeting'} onSubmit={handleSaveMeeting} className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Başlığı</Label>
                    <Input name="title" defaultValue={currentMeeting?.title || 'Pazartesi Canlı Grup Toplantısı'} required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Tarihi & Saati</Label>
                    <Input name="meeting_date" defaultValue={currentMeeting?.meeting_date || 'Her Pazartesi 20:30'} required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Linki (Google Meet veya Zoom)</Label>
                    <Input name="meeting_url" type="url" placeholder="https://meet.google.com/..." defaultValue={currentMeeting?.meeting_url || ''} required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Notu</Label>
                    <Textarea name="notes" rows={2} defaultValue={currentMeeting?.notes || ''} />
                  </div>
                  <Button type="submit" disabled={meetingLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
                    {meetingLoading ? 'Kaydediliyor...' : 'Toplantı Linkini Güncelle'}
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

        {/* SEKME 5: GEÇMİŞ TOPLANTI KAYITLARI */}
        {activeMenu === 'records' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Geçmiş Toplantı Kayıt Arşivi</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Katılamayan danışanların izleyebilmesi için Drive/Meet kayıt linklerini buraya ekleyin.</p>
            </div>

            <Card className="border-stone-200/80 shadow-xs bg-white max-w-xl">
              <CardHeader><CardTitle className="text-base font-bold text-stone-900">Yeni Toplantı Kaydı Ekle</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddMeetingRecord} className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Konusu / Başlığı *</Label>
                    <Input name="title" placeholder="Örn: Enflamasyon & Bağırsak Mikrobiyotası Soru-Cevap" required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Toplantı Tarihi *</Label>
                    <Input name="record_date" placeholder="Örn: 12.10.2026 Pazartesi" required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Kayıt Linki (Google Drive / Meet vb.) *</Label>
                    <Input name="record_url" type="url" placeholder="https://drive.google.com/file/d/..." required />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Kısa Not / Danışana Mesaj</Label>
                    <Textarea name="notes" rows={2} placeholder="Bu toplantıda konuşulan temel noktalar..." />
                  </div>
                  <Button type="submit" disabled={recordLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
                    {recordLoading ? 'Ekleniyor...' : <><PlusCircle className="w-4 h-4 mr-1.5" /> Kaydı Danışan Paneline Ekle</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetingRecords.map((rec) => (
                <Card key={rec.id} className="border-stone-200/80 shadow-xs bg-white p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-orange-100 text-orange-900 border-orange-200 text-xs">
                        {rec.record_date}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => deleteMeetingRecord(rec.id)} className="text-stone-400 hover:text-red-600 h-7 w-7 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1">{rec.title}</h3>
                    {rec.notes && <p className="text-xs text-stone-600 line-clamp-2 mb-3">{rec.notes}</p>}
                  </div>
                  <a href={rec.record_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-semibold text-orange-600 hover:underline pt-2 border-t border-stone-100">
                    Kaydı Görüntüle <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SEKME 6: DANIŞAN YORUMLARI */}
        {activeMenu === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Danışan Yorumları & Değerlendirmeler</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Danışanların gönderdiği yorumları inceleyin. "Onayla" dediğiniz yorumlar ana sayfada soyadı gizlenerek (Örn: Ahmet Y****) yayınlanır.
              </p>
            </div>

            <Card className="border-stone-200/80 shadow-xs bg-white">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Danışan Adı</TableHead>
                      <TableHead>Puan</TableHead>
                      <TableHead>Yorum</TableHead>
                      <TableHead>Ana Sayfa Durumu</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <TableRow key={rev.id} className="hover:bg-stone-50/60">
                          <TableCell className="font-semibold text-stone-900">
                            {rev.fullname}
                            <span className="block text-[11px] text-muted-foreground font-normal">
                              Görünecek: {maskName(rev.fullname)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {rev.rating}/5
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md text-xs text-stone-700 whitespace-pre-line">
                            "{rev.comment}"
                          </TableCell>
                          <TableCell>
                            {rev.is_approved ? (
                              <Badge className="bg-emerald-600 text-white text-[11px] font-medium">Yayında</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[11px] font-medium">Onay Bekliyor</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              size="sm" 
                              variant={rev.is_approved ? "outline" : "default"}
                              onClick={() => toggleReviewApproval(rev.id, rev.is_approved)}
                              className={`text-xs cursor-pointer ${
                                rev.is_approved 
                                  ? 'border-stone-300 text-stone-600 hover:bg-stone-100' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {rev.is_approved ? 'Gizle' : 'Onayla'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteReview(rev.id)} 
                              className="text-stone-400 hover:text-red-600 h-8 w-8 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-stone-400 text-xs italic">
                          Henüz danışan yorumu bulunmuyor.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SEKME 7: VİDEO YÖNETİMİ */}
        {activeMenu === 'videos' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Eğitim Videoları Yönetimi</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Videoları ve bölümleri tek tıkla organize edin</p>
              </div>
              {editingVideo && (
                <Button variant="outline" size="sm" onClick={cancelEditVideo} className="cursor-pointer">
                  <X className="w-4 h-4 mr-1.5" /> Düzenlemeden Vazgeç
                </Button>
              )}
            </div>

            <Card className={`border shadow-xs bg-white ${editingVideo ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-stone-200/80'}`}>
              <CardHeader>
                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                  {editingVideo ? <Edit2 className="w-4 h-4 text-orange-600" /> : <PlusCircle className="w-4 h-4 text-orange-600" />}
                  {editingVideo ? `Videoyu Düzenle: "${editingVideo.title}"` : 'Yeni Video Ekle'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Bölüm adını serbestçe yazabilir veya hazır butonlara tıklayarak seçebilirsiniz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videoError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{videoError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveVideo} className="space-y-4 max-w-lg">
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Video Başlığı *</Label>
                    <Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="Örn: Enflamasyon ve Bağırsak Sağlığı" required />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5 mb-1.5">
                      <Layers className="w-3.5 h-3.5 text-orange-600" /> Bölüm / Part / Hafta Adı *
                    </Label>
                    <Input value={videoSection} onChange={(e) => setVideoSection(e.target.value)} placeholder="Örn: 1. Hafta (Part 1)" required />
                    {allAvailableSections.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] text-muted-foreground block mb-1">Mevcut partlardan seçmek için tıklayın:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {allAvailableSections.map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => setVideoSection(sec)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                videoSection === sec 
                                  ? 'bg-orange-600 text-white border-orange-600 font-bold' 
                                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-orange-50'
                              }`}
                            >
                              {sec}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Video Bağlantı Linki (Bunny.net vb.) *</Label>
                    <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://player.mediadelivery.net/play/..." required />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Açıklama / Danışana Notlar</Label>
                    <Textarea value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} placeholder="Video içeriği hakkında kısa bilgi..." />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Bölüm İçi Sıralama Numarası *</Label>
                    <Input type="number" min={1} value={videoOrder} onChange={(e) => setVideoOrder(Number(e.target.value))} required />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={videoLoading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-semibold">
                      {videoLoading ? 'Kaydediliyor...' : editingVideo ? 'Değişiklikleri Güncelle' : 'Videoyu Kaydet'}
                    </Button>
                    {editingVideo && (
                      <Button type="button" variant="outline" onClick={cancelEditVideo} className="cursor-pointer">
                        Vazgeç
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-stone-900">Mevcut Videolar</h3>
              {Object.keys(groupedVideosForAdmin).length > 0 ? (
                Object.keys(groupedVideosForAdmin).map((sectionName) => (
                  <Card key={sectionName} className="border-stone-200/80 shadow-xs bg-white overflow-hidden">
                    <div className="bg-orange-50/70 border-b border-orange-100 p-3.5 flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-orange-600" />
                        <h4 className="font-bold text-sm text-stone-900">{sectionName}</h4>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => openRenameSectionModal(sectionName)}
                          className="h-7 px-2 text-[11px] text-orange-800 hover:bg-orange-100/70 cursor-pointer font-medium"
                        >
                          <Edit2 className="w-3 h-3 mr-1 text-orange-600" /> Bölüm Adını Değiştir
                        </Button>
                      </div>
                      <Badge variant="secondary" className="bg-white border-orange-200 text-orange-900 text-xs">
                        {groupedVideosForAdmin[sectionName].length} Video
                      </Badge>
                    </div>

                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">Sıra</TableHead>
                            <TableHead>Video Başlığı</TableHead>
                            <TableHead className="w-28 text-center">Sırayı Değiştir</TableHead>
                            <TableHead className="text-right w-36">İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedVideosForAdmin[sectionName]
                            .sort((a, b) => a.order - b.order)
                            .map((v, idx) => (
                              <TableRow key={v.id} className="hover:bg-stone-50/60">
                                <TableCell>
                                  <Badge className="bg-orange-600 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center p-0">
                                    {v.order}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold text-stone-900 block">{v.title}</span>
                                  <span className="text-xs text-muted-foreground truncate block max-w-md">{v.description || 'Açıklama yok'}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      onClick={() => moveVideoOrder(v, 'up')}
                                      disabled={idx === 0}
                                      className="h-7 w-7 text-stone-600 hover:text-orange-600 disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      onClick={() => moveVideoOrder(v, 'down')}
                                      disabled={idx === groupedVideosForAdmin[sectionName].length - 1}
                                      className="h-7 w-7 text-stone-600 hover:text-orange-600 disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                  <Button variant="ghost" size="sm" onClick={() => startEditVideo(v)} className="text-stone-600 hover:text-orange-600 h-8 px-2 text-xs cursor-pointer">
                                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Düzenle
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => deleteVideo(v.id)} className="text-stone-400 hover:text-red-600 h-8 w-8 cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-stone-200">
                  <p className="text-xs text-stone-400">Henüz eklenmiş video bulunmuyor.</p>
                </div>
              )}
            </div>

            {renamingSection && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white shadow-2xl border-orange-200 animate-in fade-in zoom-in-95">
                  <CardHeader className="border-b border-stone-100 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-bold text-stone-900">Bölüm Adını Değiştir</CardTitle>
                        <CardDescription className="text-xs text-stone-500 mt-0.5">
                          Eski isim: <strong>"{renamingSection}"</strong>
                        </CardDescription>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => setRenamingSection(null)} className="cursor-pointer">
                        <X className="w-4 h-4 text-stone-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <form onSubmit={handleRenameSectionSubmit} className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold text-stone-800">Yeni Bölüm / Part Adı</Label>
                        <Input value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} required autoFocus className="mt-1" />
                      </div>
                      <div className="pt-2 flex gap-2 justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => setRenamingSection(null)} className="cursor-pointer">
                          Vazgeç
                        </Button>
                        <Button type="submit" disabled={renameLoading} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
                          {renameLoading ? 'Güncelleniyor...' : <><Check className="w-3.5 h-3.5 mr-1" /> Değiştir ve Kaydet</>}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* SEKME 8: YAZILAR & DUYURULAR */}
        {activeMenu === 'posts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Yazılar & Duyurular</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Ana sayfada yayınlanan içerikleri yönetin</p>
              </div>
              {editingPost && (
                <Button variant="outline" size="sm" onClick={() => setEditingPost(null)} className="cursor-pointer">
                  <X className="w-4 h-4 mr-1.5" /> Düzenlemeden Vazgeç
                </Button>
              )}
            </div>

            <Card className={`border shadow-xs bg-white ${editingPost ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-stone-200/80'}`}>
              <CardHeader>
                <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
                  {editingPost ? <Edit2 className="w-4 h-4 text-orange-600" /> : <PlusCircle className="w-4 h-4 text-orange-600" />}
                  {editingPost ? `İçeriği Düzenle: "${editingPost.title}"` : 'Yeni İçerik / Duyuru Yayınla'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form key={editingPost ? editingPost.id : 'new-post'} onSubmit={handleSavePost} className="space-y-4 max-w-xl">
                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Başlık *</Label>
                    <Input name="title" defaultValue={editingPost?.title || ''} placeholder="Örn: Yeni Instagram Videomuz Yayında!" required />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">İçerik Yazısı *</Label>
                    <Textarea name="content" rows={3} defaultValue={editingPost?.content || ''} placeholder="Açıklama metni..." required />
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <Label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-orange-600" /> Görsel
                    </Label>
                    
                    {editingPost?.image_url && (
                      <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-stone-200 text-xs">
                        <img src={editingPost.image_url} alt="Mevcut" className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-stone-800 block truncate">Mevcut Görsel</span>
                          <span className="text-[11px] text-muted-foreground block truncate">Yeni dosya seçmezseniz korunur.</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[11px] text-muted-foreground block mb-1">Cihazınızdan dosya seçin:</span>
                      <Input name="image_file" type="file" accept="image/*" className="bg-white file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer" />
                    </div>

                    <div className="pt-1">
                      <span className="text-[11px] text-muted-foreground block mb-1">Veya harici link yapıştırın:</span>
                      <Input name="image_url" defaultValue={editingPost?.image_url || ''} placeholder="https://..." className="bg-white text-xs" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-800">Yönlendirme Linki (Instagram vb.)</Label>
                    <Input name="link_url" defaultValue={editingPost?.link_url || ''} placeholder="https://..." />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={postLoading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer">
                      {postLoading ? 'İşleniyor...' : editingPost ? 'Değişiklikleri Güncelle' : 'Ana Sayfada Yayınla'}
                    </Button>
                    {editingPost && (
                      <Button type="button" variant="outline" onClick={() => setEditingPost(null)} className="cursor-pointer">
                        Vazgeç
                      </Button>
                    )}
                  </div>
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
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingPost(post); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-stone-600 hover:text-orange-600 h-8 px-2 text-xs cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Düzenle
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} className="text-stone-400 hover:text-red-600 h-8 w-8 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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