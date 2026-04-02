import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'default' | 'success'
  onDismiss: () => void
}

export default function Toast({ message, type = 'default', onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // trigger slide-up
    requestAnimationFrame(() => setVisible(true))

    const fadeTimer = setTimeout(() => setFading(true), 2000)
    const removeTimer = setTimeout(() => onDismiss(), 2500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [onDismiss])

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${fading ? '!opacity-0' : ''}`}
    >
      <div className="flex items-center gap-2 bg-[#262626] border border-[#4D4D4D] rounded-full px-6 py-3 shadow-xl">
        {type === 'success' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="8" fill="#22C55E" />
            <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="text-white text-[13px] whitespace-nowrap">{message}</span>
      </div>
    </div>
  )
}
