interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

/*
 * POCHAK Filter Chip — underline tab style
 *
 * Selected: bold white text + green bottom underline
 * Unselected: dim text, no background
 */
export default function FilterChip({ label, selected = false, onClick, size = 'sm', icon }: FilterChipProps) {
  const padding = size === 'sm'
    ? { paddingLeft: 16, paddingRight: 16, marginLeft: 8, marginRight: 8 }
    : { paddingLeft: 19, paddingRight: 19, marginLeft: 8, marginRight: 8 };

  return (
    <button
      onClick={onClick}
      style={padding}
      className={`
        inline-flex items-center justify-center
        font-bold tracking-[-0.01em]
        transition-all duration-200 flex-shrink-0 select-none
        active:scale-[0.97] active:duration-75
        ${size === 'sm'
          ? 'pb-4 pt-2 text-[14px]'
          : 'pb-5 pt-2.5 text-[15px]'
        }
        ${selected
          ? 'text-foreground'
          : 'text-pochak-text-tertiary/60 hover:text-pochak-text-secondary'
        }
      `}

    >
      <span className="relative inline-flex items-center gap-1.5">
        {icon}
        {label}
        {/* Green bar — matches text width only */}
        <span
          className={`absolute left-0 right-0 h-[2.5px] rounded-full bg-primary transition-transform duration-250 origin-center ${
            selected ? 'scale-x-100' : 'scale-x-0'
          }`}
          style={{ bottom: size === 'sm' ? -10 : -12 }}
        />
      </span>
    </button>
  );
}
