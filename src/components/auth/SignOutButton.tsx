'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={
        className ??
        'flex items-center gap-2 text-[12px] text-white/55 hover:text-white transition-colors'
      }
    >
      <LogOut size={14} />
      Sair
    </button>
  )
}
