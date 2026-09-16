'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle2, ArrowLeft, HeartHandshake } from 'lucide-react'

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

    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const payload = {
      fullname: formData.get('fullname') as string,
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || '',
      message: (formData.get('reason_and_expectation') as string) || 'Başvuru yapıldı.',
      details: {
        fullname: formData.get('fullname'),
        phone: formData.get('phone'),
        age: formData.get('age'),
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
        motivation_score: formData.get('motivation_score'),
        financial_status: financialOption === 'Diğer' ? otherFinancialText : financialOption,
        notes: formData.get('notes'),
      }
    }

    const { error } = await supabase.from('forms').insert([payload])

    setLoading(false)
    if (!error) {
      setSubmitted(true)
    } else {
      alert('Form gönderilirken bir hata oluştu: ' + error.message)
    }
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
            <Button onClick={() => window.location.href = '/'} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium">
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-stone-50 flex flex-col items-center">
      {/* Üst Navigasyon Butonu */}
      <div className="max-w-3xl w-full mb-4 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-orange-800 hover:text-orange-950 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Ana Sayfaya Dön
        </Link>
        <span className="font-extrabold text-orange-700 tracking-tight text-sm">msvebeslenme.com</span>
      </div>

      <Card className="max-w-3xl w-full border-orange-200/80 shadow-sm bg-white overflow-hidden">
        {/* Soft, Yüksek Kontrastlı Karşılama Kartı */}
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

        {/* Form Soruları */}
        <CardContent className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">Ad Soyad *</Label>
              <Input name="fullname" required placeholder="Adınız Soyadınız" className="focus-visible:ring-orange-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Telefon numarası <span className="font-normal text-xs text-stone-500">(Doğru yazdığınızdan emin olun)</span> *
              </Label>
              <Input name="phone" type="tel" required placeholder="05XXXXXXXXX" className="focus-visible:ring-orange-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">E-posta Adresi (İsteğe bağlı)</Label>
              <Input name="email" type="email" placeholder="ornek@mail.com" className="focus-visible:ring-orange-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">Yaş *</Label>
              <Input name="age" required placeholder="Yaşınız" className="focus-visible:ring-orange-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">Meslek *</Label>
              <Input name="job" required placeholder="Mesleğiniz" className="focus-visible:ring-orange-500" />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-900">Medeni durum *</Label>
              <RadioGroup value={maritalStatus} onValueChange={setMaritalStatus} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Evli" id="mar-evli" />
                  <Label htmlFor="mar-evli" className="font-normal cursor-pointer text-stone-800">Evli</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bekar" id="mar-bekar" />
                  <Label htmlFor="mar-bekar" className="font-normal cursor-pointer text-stone-800">Bekar</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-900">Çocuğunuz var mı? *</Label>
              <RadioGroup value={hasChild} onValueChange={setHasChild} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Var" id="child-var" />
                  <Label htmlFor="child-var" className="font-normal cursor-pointer text-stone-800">Var</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yok" id="child-yok" />
                  <Label htmlFor="child-yok" className="font-normal cursor-pointer text-stone-800">Yok</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Ne zaman MS teşhisi aldınız ve biliyorsanız MS türünüz nedir? *
              </Label>
              <Input name="diagnosis_and_type" required placeholder="Örn: 2021 yılında RRMS teşhisi aldım" className="focus-visible:ring-orange-500" />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-900">
                Tanısı konmuş başka hastalığınız var mı? *
              </Label>
              <RadioGroup value={otherDiseaseOption} onValueChange={setOtherDiseaseOption} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yok" id="dis-yok" />
                  <Label htmlFor="dis-yok" className="font-normal cursor-pointer text-stone-800">Yok</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Var" id="dis-var" />
                  <Label htmlFor="dis-var" className="font-normal cursor-pointer text-stone-800">Var</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Diğer" id="dis-diger" />
                  <Label htmlFor="dis-diger" className="font-normal cursor-pointer text-stone-800">Diğer:</Label>
                </div>
              </RadioGroup>
              {otherDiseaseOption === 'Diğer' && (
                <Input
                  value={otherDiseaseText}
                  onChange={(e) => setOtherDiseaseText(e.target.value)}
                  placeholder="Hastalığınızı belirtiniz"
                  className="mt-2 focus-visible:ring-orange-500"
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
                  <div key={idx} className="flex items-start space-x-2">
                    <Checkbox
                      id={`sym-${idx}`}
                      checked={selectedSymptoms.includes(sym)}
                      onCheckedChange={() => toggleSymptom(sym)}
                    />
                    <Label htmlFor={`sym-${idx}`} className="text-xs font-normal leading-tight cursor-pointer text-stone-800">
                      {sym}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Label className="text-xs text-stone-500 block mb-1">Diğer şikayetiniz:</Label>
                <Input
                  value={otherSymptom}
                  onChange={(e) => setOtherSymptom(e.target.value)}
                  placeholder="Varsa diğer belirtilerinizi yazınız"
                  className="focus-visible:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-900">
                Günlük yaşamda bağımsız hareket edebiliyor musunuz? *
              </Label>
              <RadioGroup value={mobilityOption} onValueChange={setMobilityOption} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Hareketimde kısıtlanma yok, desteksiz yürüyebiliyorum" id="mob-1" />
                  <Label htmlFor="mob-1" className="font-normal cursor-pointer text-xs text-stone-800">Hareketimde kısıtlanma yok, desteksiz yürüyebiliyorum</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Hareket kısıtlılığım var, desteğe ihtiyaç duyuyorum" id="mob-2" />
                  <Label htmlFor="mob-2" className="font-normal cursor-pointer text-xs text-stone-800">Hareket kısıtlılığım var, desteğe ihtiyaç duyuyorum</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Diğer" id="mob-3" />
                  <Label htmlFor="mob-3" className="font-normal cursor-pointer text-xs text-stone-800">Diğer:</Label>
                </div>
              </RadioGroup>
              {mobilityOption === 'Diğer' && (
                <Input
                  value={otherMobilityText}
                  onChange={(e) => setOtherMobilityText(e.target.value)}
                  placeholder="Durumunuzu açıklayınız"
                  className="mt-2 focus-visible:ring-orange-500"
                  required
                />
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-900">
                Beden görüntünüz ve kilonuzla ilgili bir hedefiniz var mı? Varsa bunun önceliği ne? *
              </Label>
              <RadioGroup value={weightGoalOption} onValueChange={setWeightGoalOption} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Var. Kesinlikle belirli bir kiloya ulaşmak istiyorum, önceliğim bu." id="wg-1" />
                  <Label htmlFor="wg-1" className="font-normal cursor-pointer text-xs text-stone-800">Var. Kesinlikle belirli bir kiloya ulaşmak istiyorum, önceliğim bu.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Var ama önceliğim bu değil." id="wg-2" />
                  <Label htmlFor="wg-2" className="font-normal cursor-pointer text-xs text-stone-800">Var ama önceliğim bu değil.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yok. Asıl amacım nasıl besleneceğimi öğrenip bir düzen oluşturmak." id="wg-3" />
                  <Label htmlFor="wg-3" className="font-normal cursor-pointer text-xs text-stone-800">Yok. Asıl amacım nasıl besleneceğimi öğrenip bir düzen oluşturmak.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Diğer" id="wg-4" />
                  <Label htmlFor="wg-4" className="font-normal cursor-pointer text-xs text-stone-800">Diğer:</Label>
                </div>
              </RadioGroup>
              {weightGoalOption === 'Diğer' && (
                <Input
                  value={otherWeightGoalText}
                  onChange={(e) => setOtherWeightGoalText(e.target.value)}
                  placeholder="Hedefinizi belirtiniz"
                  className="mt-2 focus-visible:ring-orange-500"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Şu anda bu formu dolduruyor olmanızın en büyük sebebi ve bu programdan beklentiniz nedir? *
              </Label>
              <Textarea name="reason_and_expectation" required rows={3} placeholder="Düşüncelerinizi paylaşın..." className="focus-visible:ring-orange-500" />
            </div>

            <div className="space-y-3 bg-stone-100/60 p-4 rounded-xl border border-stone-200">
              <Label className="text-xs font-semibold text-stone-900 leading-relaxed block">
                MS'le Sağlıklı Yaşam; birebir diyet listeleri vermek yerine, haftalık grup toplantıları ve online eğitimlerle ilerleyen bir grup çalışmasıdır. Amacım size katı kurallar koymak değil, eğitimler eşliğinde kalıcı sağlıklı beslenme ve yaşam tarzı alışkanlıkları kazandırmaktır. Programa kaydolduğunuzda bu topluluktan ve eğitimlerden 6 ay boyunca faydalanabiliyorsunuz. Bu işleyiş sizin için uygun mu? *
              </Label>
              <RadioGroup value={groupFitOption} onValueChange={setGroupFitOption} className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Grup çalışması olması, eğitimler ve 6 aylık bu süreç bana uygun" id="gf-1" />
                  <Label htmlFor="gf-1" className="font-normal cursor-pointer text-xs text-stone-800">Grup çalışması olması, eğitimler ve 6 aylık bu süreç bana uygun</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Eğitim/grup ortamı değil, sadece birebir özel diyetisyen takibi istiyorum" id="gf-2" />
                  <Label htmlFor="gf-2" className="font-normal cursor-pointer text-xs text-stone-800">Eğitim/grup ortamı değil, sadece birebir özel diyetisyen takibi istiyorum</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Diğer" id="gf-3" />
                  <Label htmlFor="gf-3" className="font-normal cursor-pointer text-xs text-stone-800">Diğer:</Label>
                </div>
              </RadioGroup>
              {groupFitOption === 'Diğer' && (
                <Input
                  value={otherGroupFitText}
                  onChange={(e) => setOtherGroupFitText(e.target.value)}
                  placeholder="Düşüncenizi belirtiniz"
                  className="mt-2 bg-white focus-visible:ring-orange-500"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Programa katılım ve sürece devamlılık konusundaki motivasyonunuza 10 üzerinden kaç puan verirsiniz? (0-10) *
              </Label>
              <Input name="motivation_score" type="number" min={0} max={10} required placeholder="Örn: 9" className="focus-visible:ring-orange-500" />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-stone-900">
                MS'le Sağlıklı Yaşam kapsamlı bir danışmanlık programıdır ve ücretlidir. Bu sürece katılım konusunda kendinizi nasıl hissediyorsunuz? *
              </Label>
              <RadioGroup value={financialOption} onValueChange={setFinancialOption} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Kendim ve sağlığım için bütçe ayırmaya hazırım." id="fin-1" />
                  <Label htmlFor="fin-1" className="font-normal cursor-pointer text-xs text-stone-800">Kendim ve sağlığım için bütçe ayırmaya hazırım.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Maddi olarak beni zorlayabilir ama destek alarak katılabilirim." id="fin-2" />
                  <Label htmlFor="fin-2" className="font-normal cursor-pointer text-xs text-stone-800">Maddi olarak beni zorlayabilir ama destek alarak katılabilirim.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Şu an böyle bir süreç için bütçe ayırabilecek durumda değilim." id="fin-3" />
                  <Label htmlFor="fin-3" className="font-normal cursor-pointer text-xs text-stone-800">Şu an böyle bir süreç için bütçe ayırabilecek durumda değilim.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Diğer" id="fin-4" />
                  <Label htmlFor="fin-4" className="font-normal cursor-pointer text-xs text-stone-800">Diğer:</Label>
                </div>
              </RadioGroup>
              {financialOption === 'Diğer' && (
                <Input
                  value={otherFinancialText}
                  onChange={(e) => setOtherFinancialText(e.target.value)}
                  placeholder="Durumunuzu belirtiniz"
                  className="mt-2 focus-visible:ring-orange-500"
                  required
                />
              )}
            </div>

            <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-3">
              <p className="text-xs text-stone-800 leading-relaxed font-normal">
                Formlara yoğunluk durumuna göre 1 hafta içinde sırasıyla WhatsApp üzerinden dönüş yapıyorum. Bu süreyi aşarsa bana Instagram üzerinden ulaşabilirsiniz. (Bazen telefon numaranızı yanlış yazmış oluyorsunuz veya formu göndermemiş oluyorsunuz.) *
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                />
                <Label htmlFor="terms" className="text-xs font-semibold text-stone-900 cursor-pointer">
                  Bilgilendirmeyi okudum ve anladım.
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-900">
                Eklemek istediğiniz bir şey varsa yazabilirsiniz
              </Label>
              <Textarea name="notes" rows={2} placeholder="Eklemek istedikleriniz..." className="focus-visible:ring-orange-500" />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-base font-bold rounded-xl shadow-md">
              {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}