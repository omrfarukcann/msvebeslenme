'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton({ className }: { className?: string }) {
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    // Çerezleri ve oturumu tamamen temizleyip ana sayfaya yönlendir
    window.location.href = '/'
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      className={`border-stone-200 text-stone-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-colors ${className || ''}`}
    >
      <LogOut className="w-4 h-4 mr-1.5" /> Çıkış Yap
    </Button>
  )
}