export default function TabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { key: T; label: string }[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}) {
  return (
    <div className="flex border-b border-[#4D4D4D] overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-shrink-0 px-5 py-3 text-[15px] font-semibold transition-colors relative ${
            activeTab === tab.key
              ? 'text-white'
              : 'text-[#A6A6A6] hover:text-white'
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00CC33]" />
          )}
        </button>
      ))}
    </div>
  );
}
