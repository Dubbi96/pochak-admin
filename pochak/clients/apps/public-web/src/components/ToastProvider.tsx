import { createContext, useCallback, useState } from 'react'
import Toast from './Toast'

export interface ToastContextValue {
  show: (message: string, type?: 'default' | 'success') => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

interface ToastItem {
  id: number
  message: string
  type: 'default' | 'success'
}

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, type: 'default' | 'success' = 'default') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => dismiss(t.id)} />
      ))}
    </ToastContext.Provider>
  )
}
