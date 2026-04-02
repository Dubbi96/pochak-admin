import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2 text-[15px] font-semibold text-white hover:text-[#A6A6A6] transition-colors"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#A6A6A6]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#A6A6A6]" />
        )}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
