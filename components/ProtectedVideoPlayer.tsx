'use client'

function getEmbedUrl(url: string) {
  if (!url) return null

  let trimmedUrl = url.trim()

  // 1. Bunny.net "Copy Video Play Url" Linki
  // (Örn: https://player.mediadelivery.net/play/756309/c81c6871-...)
  if (trimmedUrl.includes('mediadelivery.net/play/')) {
    trimmedUrl = trimmedUrl
      .replace('player.mediadelivery.net/play/', 'iframe.mediadelivery.net/embed/')
      .replace('video.bunnycdn.com/play/', 'iframe.mediadelivery.net/embed/')
  }

  // Bunny.net linklerinde otomatik oynatmayı (autoplay) kesin olarak kapatıyoruz
  if (trimmedUrl.includes('iframe.mediadelivery.net/embed/')) {
    const separator = trimmedUrl.includes('?') ? '&' : '?'
    // autoplay=false: otomatik başlamaz, preload=true: kapak resmi ve video hemen hazır bekler
    return `${trimmedUrl}${separator}autoplay=false&preload=true`
  }

  // 2. YouTube Linki (autoplay kapalı)
  const ytMatch = trimmedUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[2]}?rel=0&modestbranding=1&autoplay=0`
  }

  // 3. Google Drive Linki
  if (trimmedUrl.includes('drive.google.com')) {
    const driveMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmedUrl.match(/id=([a-zA-Z0-9_-]+)/)
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    }
  }

  return trimmedUrl
}

export function ProtectedVideoPlayer({ url, title }: { url: string; title: string }) {
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="aspect-video w-full bg-stone-900 flex items-center justify-center text-stone-400 text-xs">
        Geçersiz Video Bağlantısı
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full bg-black select-none overflow-hidden rounded-t-xl">
      <iframe
        src={embedUrl}
        loading="lazy"
        className="w-full h-full border-0 absolute inset-0"
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture;" // autoplay iznini de çıkardık
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
      />
    </div>
  )
}