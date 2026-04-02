const defaultSports = ['축구', '야구', '배구', '핸드볼', '농구', '기타'];

export default function SportFilterTags({
  sports = defaultSports,
  selected,
  onSelect,
}: {
  sports?: string[];
  selected: string;
  onSelect: (sport: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {sports.map((sport) => (
        <button
          key={sport}
          onClick={() => onSelect(sport)}
          className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selected === sport
              ? 'bg-[#00CC33] text-[#1A1A1A]'
              : 'bg-[#262626] text-[#A6A6A6] hover:text-white hover:bg-[#404040]'
          }`}
        >
          #{sport}
        </button>
      ))}
    </div>
  );
}
