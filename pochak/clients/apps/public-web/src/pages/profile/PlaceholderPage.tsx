export function createPlaceholder(title: string) {
  return function PlaceholderPage() {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
        <p className="text-[#A6A6A6]">준비 중입니다.</p>
      </div>
    );
  };
}
