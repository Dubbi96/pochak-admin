import { useState, useRef, useEffect } from 'react'

interface ContextMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
}

export default function ContextMenu({ items, children }: ContextMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen((v) => !v)}>
        {children}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] bg-[#262626] border border-[#4D4D4D] rounded-lg shadow-xl overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                item.danger
                  ? 'text-[#E51728] hover:bg-[#333]'
                  : 'text-[#A6A6A6] hover:bg-[#333] hover:text-white'
              }`}
              onClick={() => {
                item.onClick()
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
