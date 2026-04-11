import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClasses = {
  primary:
    'bg-primary text-primary-foreground font-bold hover:brightness-110 hover:shadow-glow-md active:scale-[0.97] transition-all duration-200',
  secondary:
    'bg-card text-foreground border border-border hover:bg-secondary hover:border-border transition-all duration-200',
  ghost:
    'bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200',
  outline:
    'bg-transparent text-primary border border-primary hover:bg-primary/10 transition-all duration-200',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-[14px] rounded-lg',
  md: 'px-5 py-2.5 text-[15px] rounded-lg',
  lg: 'px-8 py-3.5 text-[15px] rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
