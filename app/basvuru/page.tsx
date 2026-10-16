'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CheckCircle2, ArrowLeft, HeartHandshake, Shield, X } from 'lucide-react'

const SYMPTOMS_LIST = [
  "Yorgunluk",
  "Uyuşma, karıncalanma, his kaybı, yanma vb. duyusal belirtiler",
  "Kabızlık, ishal, gaz, şişkinlik vb. sindirim problemleri",
  "Uyku problemleri",
  "Unutkanlık, odaklanamama, beyin sisi vb. bilişsel problemler",
  "İdrar problemleri",
  "Kaslarda kasılma, sertlik, güçsüzlük",
  "Görme sorunları",
  "Denge kaybı",
  "Yürümede zorluk",
  "Baş ağrısı, baş dönmesi",
  "Depresif hissetme, anksiyete",
  "Cinsel fonksiyonlarda azalma",
  "Ağrı"
]

export default function BasvuruPage() {
  const supabase = createClient()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false)

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [otherSymptom, setOtherSymptom] = useState('')

  const [maritalStatus, setMaritalStatus] = useState('Evli')
  const [hasChild, setHasChild] = useState('Yok')
  const [otherDiseaseOption, setOtherDiseaseOption] = useState('Yok')
  const [otherDiseaseText, setOtherDiseaseText] = useState('')

  const [mobilityOption, setMobilityOption] = useState('Hareketimde kısıtlanma yok, desteksiz yürüyebiliyorum')
  const [otherMobilityText, setOtherMobilityText] = useState('')

  const [weightGoalOption, setWeightGoalOption] = useState('Yok. Asıl amacım nasıl besleneceğimi öğrenip bir düzen oluşturmak.')
  const [otherWeightGoalText, setOtherWeightGoalText] = useState('')

  const [groupFitOption, setGroupFitOption] = useState('Grup çalışması olması, eğitimler ve 6 aylık bu süreç bana uygun')
  const [otherGroupFitText, setOtherGroupFitText] = useState('')

  const [financialOption, setFinancialOption] = useState('Kendim ve sağlığım için bütçe ayırmaya hazırım.')
  const [otherFinancialText, setOtherFinancialText] = useState('')

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [kvkkAccepted, setKvkkAccepted] = useState(false)

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!termsAccepted) {
      alert('Lütfen bilgilendirmeyi okuyup onay kutucuğunu işaretleyiniz.')
      return
    }

    if (!kvkkAccepted) {
      alert('Lütfen KVKK ve Sağlık Verileri Aydınlatma Metnini onaylayınız.')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const fullname = formData.get('fullname') as string
    const phone = formData.get('phone') as string
    const age = formData.get('age') as string
    const motivation_score = formData.get('motivation_score') as string

    const payload = {
      fullname,
      phone,
      email: (formData.get('email') as string) || '',
      message: (formData.get('reason_and_expectation') as string) || 'Başvuru yapıldı.',
      details: {
        fullname,
        phone,
        age,
        job: formData.get('job'),
        marital_status: maritalStatus,
        has_child: hasChild,
        diagnosis_and_type: formData.get('diagnosis_and_type'),
        other_disease: otherDiseaseOption === 'Diğer' ? otherDiseaseText : otherDiseaseOption,
        symptoms: otherSymptom ? [...selectedSymptoms, `Diğer: ${otherSymptom}`] : selectedSymptoms,
        mobility: mobilityOption === 'Diğer' ? otherMobilityText : mobilityOption,
        weight_goal: weightGoalOption === 'Diğer' ? otherWeightGoalText : weightGoalOption,
        reason_and_expectation: formData.get('reason_and_expectation'),
        group_fit: groupFitOption === 'Diğer' ? otherGroupFitText : groupFitOption,
        motivation_score,
        financial_status: financialOption === 'Diğer' ? otherFinancialText : financialOption,
        notes: formData.get('notes'),
      }
    }

    const { error } = await supabase.from('forms').insert([payload])

    if (!error) {
      // Arka planda diyetisyene bildirim at
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, phone, age, motivation_score })
      }).catch(() => {})

      setSubmitted(true)
    } else {
      alert('Form gönderilirken bir hata oluştu: ' + error.message)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
        <Card className="max-w-md w-full text-center p-8 border-orange-100 shadow-sm bg-white">
          <CardContent className="pt-4">
            <CheckCircle2 className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Başvurunuz Alındı!</h2>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">
              Formunuz Diyetisyen Sümeyye Can'a iletilmiştir. Bilgileriniz incelendikten sonra en kısa sürede WhatsApp üzerinden iletişime geçilecektir.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium cursor-pointer">
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-stone-50 flex flex-col items-center">
      <div className="max-w-3xl w-full mb-4 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-orange-800 hover:text-orange-950 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Ana Sayfaya Dön
        </Link>
        <span className="font-extrabold text-orange-700 tracking-tight text-sm">msvebeslenme</span>
      </div>

      <Card className="max-w-3xl w-full border-orange-200/80 shadow-sm bg-white overflow-hidden">
        <div className="bg-orange-100/60 border-b border-orange-200/60 p-6 md:p-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-200/60 text-orange-900 text-xs font-semibold mb-3">
            <HeartHandshake className="w-3.5 h-3.5" /> Diyetisyen Sümeyye Can
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 mb-4 tracking-tight">MS'le Sağlıklı Yaşam Başvuru Formu</h1>
          <div className="text-stone-800 text-sm leading-relaxed space-y-3 font-normal">
            <p className="font-semibold text-stone-900">Merhaba, ben Diyetisyen Sümeyye Can</p>
            <p>
              Uzun zamandır sadece MS hastalarıyla çalışan MS'li bir diyetisyen olarak, bu süreçte kendinizi daha iyi hissetmenize destek olmak için buradayım. Sizi katı yasaklarla, stresli diyet listeleriyle yormadan, adım adım sürdürülebilir sağlıklı alışkanlıklar kazanmanıza yardımcı oluyorum. Amacım, MS sürecini daha sağlıklı bir şekilde yönetmenize destek olmak ve yaşam kalitenizi artırmak.
            </p>
            <p>
              Bu form sizi biraz daha yakından tanıyabilmem ve ihtiyaçlarınıza en uygun şekilde size dönüş yapabilmem için hazırlandı. Ne kadar içten ve detaylı doldurursanız ben de size o kadar iyi destek olabilirim.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-orange-200 text-xs font-medium text-orange-900">
            * Zorunlu soruları belirtir.
          </div>
        </div>

        <CardContent className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">Ad Soyad *</Label>
              <Input name="fullname" required placeholder="Adınız Soyadınız" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Telefon numarası <span className="font-normal text-xs text-stone-500">(Doğru yazdığınızdan emin olun)</span> *
              </Label>
              <Input name="phone" type="tel" required placeholder="05XXXXXXXXX" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">E-posta Adresi (İsteğe bağlı)</Label>
              <Input name="email" type="email" placeholder="ornek@mail.com" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">Yaş *</Label>
              <Input name="age" required placeholder="Yaşınız" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">Meslek *</Label>
              <Input name="job" required placeholder="Mesleğiniz" />
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-stone-900 block">Medeni durum *</Label>
              <div className="space-y-2">
                {['Evli', 'Bekar'].map((val) => (
                  <label key={val} className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="maritalStatusRadio"
                      value={val}
                      checked={maritalStatus === val}
                      onChange={() => setMaritalStatus(val)}
                      className="w-4 h-4 text-orange-600 border-stone-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <span className="text-sm text-stone-800">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-stone-900 block">Çocuğunuz var mı? *</Label>
              <div className="space-y-2">
                {['Var', 'Yok'].map((val) => (
                  <label key={val} className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="hasChildRadio"
                      value={val}
                      checked={hasChild === val}
                      onChange={() => setHasChild(val)}
                      className="w-4 h-4 text-orange-600 border-stone-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <span className="text-sm text-stone-800">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Ne zaman MS teşhisi aldınız ve biliyorsanız MS türünüz nedir? *
              </Label>
              <Input name="diagnosis_and_type" required placeholder="Örn: 2021 yılında RRMS teşhisi aldım" />
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-stone-900 block">
                Tanısı konmuş başka hastalığınız var mı? *
              </Label>
              <div className="space-y-2">
                {['Yok', 'Var', 'Diğer'].map((val) => (
                  <label key={val} className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="otherDiseaseRadio"
                      value={val}
                      checked={otherDiseaseOption === val}
                      onChange={() => setOtherDiseaseOption(val)}
                      className="w-4 h-4 text-orange-600 border-stone-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <span className="text-sm text-stone-800">{val === 'Diğer' ? 'Diğer:' : val}</span>
                  </label>
                ))}
              </div>
              {otherDiseaseOption === 'Diğer' && (
                <Input
                  value={otherDiseaseText}
                  onChange={(e) => setOtherDiseaseText(e.target.value)}
                  placeholder="Hastalığınızı belirtiniz"
                  className="mt-2"
                  required
                />
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-900">
                Günlük hayatınızda sizi en çok zorlayan MS semptomları hangileri? *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {SYMPTOMS_LIST.map((sym, idx) => (
                  <label key={idx} className="flex items-start space-x-2.5 cursor-pointer select-none p-1 hover:bg-stone-100/50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(sym)}
                      onChange={() => toggleSymptom(sym)}
                      className="w-4 h-4 mt-0.5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600 shrink-0"
                    />
                    <span className="text-xs font-normal text-stone-800 leading-snug">
                      {sym}
                    </span>
                  </label>
                ))}
              </div>
              <div className="pt-2">
                <Label className="text-xs text-stone-500 block mb-1">Diğer şikayetiniz:</Label>
                <Input
                  value={otherSymptom}
                  onChange={(e) => setOtherSymptom(e.target.value)}
                  placeholder="Varsa diğer belirtilerinizi yazınız"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-stone-900 block">
                Günlük yaşamda bağımsız hareket edebiliyor musunuz? *
              </Label>
              <div className="space-y-2">
                {[
                  'Hareketimde kısıtlanma yok, desteksiz yürüyebiliyorum',
                  'Hareket kısıtlılığım var, desteğe ihtiyaç duyuyorum',
                  'Diğer'
                ].map((val) => (
                  <label key={val} className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="mobilityRadio"
                      value={val}
                      checked={mobilityOption === val}
                      onChange={() => setMobilityOption(val)}
                      className="w-4 h-4 text-orange-600 border-stone-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <span className="text-xs text-stone-800">{val === 'Diğer' ? 'Diğer:' : val}</span>
                  </label>
                ))}
              </div>
              {mobilityOption === 'Diğer' && (
                <Input
                  value={otherMobilityText}
                  onChange={(e) => setOtherMobilityText(e.target.value)}
                  placeholder="Durumunuzu açıklayınız"
                  className="mt-2"
                  required
                />
              )}
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-stone-900 block">
                Beden görüntünüz ve kilonuzla ilgili bir hedefiniz var mı? Varsa bunun önceliği ne? *
              </Label>
              <div className="space-y-2">
                {[
                  'Var. Kesinlikle belirli bir kiloya ulaşmak istiyorum, önceliğim bu.',
                  'Var ama önceliğim bu değil.',
                  'Yok. Asıl amacım nasıl besleneceğimi öğrenip bir düzen oluşturmak.',
                  'Diğer'
                ].map((val) => (
                  <label key={val} className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="weightGoalRadio"
                      value={val}
                      checked={weightGoalOption === val}
                      onChange={() => setWeightGoalOption(val)}
                      className="w-4 h-4 text-orange-600 border-stone-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <span className="text-xs text-stone-800">{val === 'Diğer' ? 'Diğer:' : val}</span>
                  </label>
                ))}
              </div>
              {weightGoalOption === 'Diğer' && (
                <Input
                  value={otherWeightGoalText}
                  onChange={(e) => setOtherWeightGoalText(e.target.value)}
                  placeholder="Hedefinizi belirtiniz"
                  className="mt-2"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Şu anda bu formu dolduruyor olmanızın en büyük sebebi ve bu programdan beklentiniz nedir? *
              </Label>
              <Textarea name="reason_and_expectation" required rows={3} placeholder="Düşüncelerinizi paylaşın..." />
            </div>

            <div className="space-y-3 bg-stone-100/60 p-4 rounded-xl border border-stone-200">
              <Label className="text-xs font-semibold text-stone-900 leading-relaxed block">
                MS'le Sağlıklı Yaşam; birebir diyet listeleri vermek yerine, haftalık grup toplantıları ve online eğitimlerle ilerleyen bir grup çalışmasıdır. Amacım size katı kurallar koymak değil, eğitimler eşliğinde kalıcı sağlıklı beslenme ve yaşam tarzı alışkanlıkları kazandırmaktır. Programa kaydolduğunuzda bu topluluktan ve eğitimlerden 6 ay boyunca faydalanabiliyorsunuz. Bu işleyiş sizin için uygun mu? *
              </Label>
              <div className="space-y-2 mt-2">
                {[
                  'Grup çalışması olması, eğitimler ve 6 aylık bu süreç bana uygun',
                  'Eğitim/grup ortamı değil, sadece birebir özel diyetisyen takibi istiyorum',
                  'Diğer'
                ].map((val) => (
                  <label key={val} className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="groupFitRadio"
                      value={val}
                      checked={groupFitOption === val}
                      onChange={() => setGroupFitOption(val)}
                      className="w-4 h-4 text-orange-600 border-stone-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <span className="text-xs text-stone-800">{val === 'Diğer' ? 'Diğer:' : val}</span>
                  </label>
                ))}
              </div>
              {groupFitOption === 'Diğer' && (
                <Input
                  value={otherGroupFitText}
                  onChange={(e) => setOtherGroupFitText(e.target.value)}
                  placeholder="Düşüncenizi belirtiniz"
                  className="mt-2 bg-white"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Programa katılım ve sürece devamlılık konusundaki motivasyonunuza 10 üzerinden kaç puan verirsiniz? (0-10) *
              </Label>
              <Input name="motivation_score" type="number" min={0} max={10} required placeholder="Örn: 9" />
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-stone-900 block">
                MS'le Sağlıklı Yaşam kapsamlı bir danışmanlık programıdır ve ücretlidir. Bu sürece katılım konusunda kendinizi nasıl hissediyorsunuz? *
              </Label>
              <div className="space-y-2">
                {[
                  'Kendim ve sağlığım için bütçe ayırmaya hazırım.',
                  'Maddi olarak beni zorlayabilir ama destek alarak katılabilirim.',
                  'Şu an böyle bir süreç için bütçe ayırabilecek durumda değilim.',
                  'Diğer'
                ].map((val) => (
                  <label key={val} className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="financialRadio"
                      value={val}
                      checked={financialOption === val}
                      onChange={() => setFinancialOption(val)}
                      className="w-4 h-4 text-orange-600 border-stone-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                    <span className="text-xs text-stone-800">{val === 'Diğer' ? 'Diğer:' : val}</span>
                  </label>
                ))}
              </div>
              {financialOption === 'Diğer' && (
                <Input
                  value={otherFinancialText}
                  onChange={(e) => setOtherFinancialText(e.target.value)}
                  placeholder="Durumunuzu belirtiniz"
                  className="mt-2"
                  required
                />
              )}
            </div>

            {/* Bilgilendirme Onayı */}
            <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-3">
              <p className="text-xs text-stone-800 leading-relaxed font-normal">
                Formlara yoğunluk durumuna göre 1 hafta içinde sırasıyla WhatsApp üzerinden dönüş yapıyorum. Bu süreyi aşarsa bana Instagram üzerinden ulaşabilirsiniz. (Bazen telefon numaranızı yanlış yazmış oluyorsunuz veya formu göndermemiş oluyorsunuz.) *
              </p>
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
                />
                <span className="text-xs font-semibold text-stone-900">
                  Bilgilendirmeyi okudum ve anladım.
                </span>
              </label>
            </div>

            {/* YASAL GÜVENCE: KVKK VE SAĞLIK VERİSİ AYDINLATMA METNİ */}
            <div className="p-4 bg-stone-100/70 border border-stone-200 rounded-xl space-y-2">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={kvkkAccepted}
                  onChange={(e) => setKvkkAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600 shrink-0"
                />
                <span className="text-xs text-stone-700 leading-relaxed">
                  Paylaştığım sağlık ve kişisel verilerimin beslenme danışmanlığı kapsamında işlenmesine ilişkin{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setKvkkModalOpen(true); }}
                    className="text-orange-700 font-bold underline hover:text-orange-900 inline"
                  >
                    KVKK ve Sağlık Verileri Aydınlatma Metni
                  </button>
                  'ni okudum, kabul ediyorum. *
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Eklemek istediğiniz bir şey varsa yazabilirsiniz
              </Label>
              <Textarea name="notes" rows={2} placeholder="Eklemek istedikleriniz..." />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-base font-bold rounded-xl shadow-md cursor-pointer">
              {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* KVKK AYDINLATMA METNİ MODAL */}
      {kvkkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-xl bg-white shadow-2xl border-stone-200 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base text-stone-900">KVKK ve Sağlık Verileri Aydınlatma Metni</h3>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setKvkkModalOpen(false)}>
                <X className="w-4 h-4 text-stone-500" />
              </Button>
            </div>
            <div className="p-6 text-xs text-stone-700 space-y-4 overflow-y-auto leading-relaxed">
              <p>
                <strong>1. Veri Sorumlusu:</strong> Bu form aracılığıyla toplanan kişisel ve özel nitelikli sağlık verileriniz, Diyetisyen Sümeyye Can (msvebeslenme) tarafından 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca korunmaktadır.
              </p>
              <p>
                <strong>2. İşleme Amacı:</strong> Formda paylaştığınız ad, telefon, yaş, MS teşhis yılı, semptomlar ve beslenme öyküsü gibi veriler; yalnızca size özel bireysel beslenme protokolü hazırlamak, ön görüşme sağlamak ve danışmanlık sürecini yürütmek amacıyla işlenir.
              </p>
              <p>
                <strong>3. Gizlilik ve Üçüncü Taraflar:</strong> Sağlık verileriniz kesinlikle reklam, pazarlama veya ticari amaçlarla üçüncü şahıs veya kurumlarla paylaşılmaz.
              </p>
              <p>
                <strong>4. Haklarınız:</strong> KVKK'nın 11. maddesi kapsamında dilediğiniz zaman verilerinizin silinmesini, güncellenmesini veya işlenme amacını talep etme hakkına sahipsiniz.
              </p>
            </div>
            <div className="p-4 border-t border-stone-100 flex justify-end">
              <Button onClick={() => { setKvkkAccepted(true); setKvkkModalOpen(false); }} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                Okudum, Onaylıyorum
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}