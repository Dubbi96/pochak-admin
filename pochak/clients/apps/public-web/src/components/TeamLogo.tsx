export default function TeamLogo({
  color,
  short,
  size = 'md',
}: {
  color: string;
  short: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const s = size === 'lg' ? 'w-14 h-14 text-sm' : size === 'sm' ? 'w-8 h-8 text-[9px]' : 'w-10 h-10 text-[10px]';
  return (
    <div
      className={`${s} rounded-full flex items-center justify-center font-bold text-white border-2 border-[#4D4D4D]`}
      style={{ backgroundColor: color }}
    >
      {short}
    </div>
  );
}
