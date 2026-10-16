'use client'

import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp({ phoneNumber = "905XXXXXXXXX" }: { phoneNumber?: string }) {
  const message = encodeURIComponent("Merhaba Sümeyye Hanım, msvebeslenme danışan portalından yazıyorum. Bir konuda danışmak istemiştim.")
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-xs md:text-sm group"
      title="Diyetisyene WhatsApp'tan Yazın"
    >
      <MessageCircle className="w-5 h-5 fill-white" />
      <span className="hidden sm:inline">Diyetisyene Ulaş</span>
    </a>
  )
}