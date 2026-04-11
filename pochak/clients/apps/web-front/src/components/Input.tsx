import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/*
 * OTT Form Input with label + error
 * - Modern dark surface with subtle glass effect
 * - Focus: accent glow ring
 * - Error: red border with message
 */
export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-[14px] font-medium text-pochak-text-secondary">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-[15px]
          text-foreground placeholder-pochak-text-muted
          outline-none transition-all duration-200
          border-white/[0.1]
          hover:border-white/[0.18] hover:bg-white/[0.06]
          focus:border-primary/50
          focus:bg-white/[0.06]
          focus:ring-4 focus:ring-primary/8
          ${error ? 'border-pochak-live/50 focus:border-pochak-live focus:ring-pochak-live/10' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-[13px] text-pochak-live flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-pochak-live" />
          {error}
        </p>
      )}
    </div>
  );
}
