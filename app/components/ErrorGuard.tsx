"use client"

import { useEffect } from 'react'

export default function ErrorGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const suppress = (e: any) => {
      const msg = String(e?.reason?.message || e?.message || '')
      const stack = String(e?.reason?.stack || e?.error?.stack || '')
      const file = String(e?.filename || '')
      const fromFS = stack.includes('fullstory') || stack.includes('edge.fullstory.com') || file.includes('fullstory') || file.includes('fs.js')
      const lower = msg.toLowerCase()
      const isAbort = lower.includes('abort') || (e?.reason?.name === 'AbortError')
      const isNetFail = lower.includes('failed to fetch')
      if (fromFS || isAbort || isNetFail) {
        e.preventDefault?.(); e.stopImmediatePropagation?.(); return false
      }
    }
    window.addEventListener('unhandledrejection', suppress, { capture: true })
    window.addEventListener('error', suppress, { capture: true })
    return () => {
      window.removeEventListener('unhandledrejection', suppress as any, { capture: true } as any)
      window.removeEventListener('error', suppress as any, { capture: true } as any)
    }
  }, [])
  return null
}
