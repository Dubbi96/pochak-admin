import { useEffect, type ReactNode } from 'react';
import { LuX } from 'react-icons/lu';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-pochak-surface border border-white/[0.06] rounded-2xl shadow-2xl animate-scale-in overflow-hidden" role="dialog" aria-modal="true" aria-label={title}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <h2 className="text-[16px] font-bold tracking-tight text-foreground">{title}</h2>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center text-pochak-text-secondary hover:bg-white/[0.12] hover:text-foreground transition-all duration-150 active:scale-90" aria-label="닫기">
              <LuX className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
