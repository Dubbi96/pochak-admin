import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubTabChips } from './shared';

type Tab = 'all' | 'charge' | 'use' | 'gift';

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'charge', label: '충전' },
  { key: 'use', label: '사용' },
  { key: 'gift', label: '선물' },
];

const transactions = [
  { date: '2026.03.20', desc: '볼 충전', amount: '+5,000P', balance: '10,000P', type: 'charge' as const },
  { date: '2026.03.18', desc: '대회 시청권 구매', amount: '-2,000P', balance: '5,000P', type: 'use' as const },
  { date: '2026.03.15', desc: '볼 충전', amount: '+3,000P', balance: '7,000P', type: 'charge' as const },
  { date: '2026.03.12', desc: '친구에게 선물', amount: '-1,000P', balance: '4,000P', type: 'gift' as const },
  { date: '2026.03.10', desc: '이벤트 적립', amount: '+500P', balance: '5,000P', type: 'charge' as const },
  { date: '2026.03.08', desc: '클립 구매', amount: '-800P', balance: '4,500P', type: 'use' as const },
  { date: '2026.03.05', desc: '기프트볼 선물 받음', amount: '+2,000P', balance: '5,300P', type: 'gift' as const },
  { date: '2026.03.03', desc: '시설 예약', amount: '-1,500P', balance: '3,300P', type: 'use' as const },
  { date: '2026.03.01', desc: '볼 충전', amount: '+4,000P', balance: '4,800P', type: 'charge' as const },
  { date: '2026.02.28', desc: '선물 보내기', amount: '-700P', balance: '800P', type: 'gift' as const },
];

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const navigate = useNavigate();

  const filtered = activeTab === 'all' ? transactions : transactions.filter((t) => t.type === activeTab);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">볼/기프트볼 관리</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#262626] rounded-xl border border-[#4D4D4D] p-5 flex flex-col items-center">
          <span className="text-[13px] text-[#A6A6A6] mb-2">볼</span>
          <span className="text-2xl font-bold text-[#00CC33] mb-3">10,000P</span>
          <button
            onClick={() => navigate('/store')}
            className="px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00B82E] transition-colors"
          >
            충전
          </button>
        </div>
        <div className="bg-[#262626] rounded-xl border border-[#4D4D4D] p-5 flex flex-col items-center">
          <span className="text-[13px] text-[#A6A6A6] mb-2">기프트볼</span>
          <span className="text-2xl font-bold text-white">1,000P</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <SubTabChips tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Transaction history */}
      <div className="space-y-2">
        {filtered.map((tx, idx) => (
          <div
            key={idx}
            className="bg-[#262626] rounded-xl border border-[#4D4D4D] px-4 py-3 flex items-center justify-between text-[13px]"
          >
            <span className="text-[#A6A6A6] w-[90px] flex-shrink-0">{tx.date}</span>
            <span className="text-white flex-1 truncate px-2">{tx.desc}</span>
            <span
              className={`w-[80px] text-right flex-shrink-0 font-semibold ${
                tx.amount.startsWith('+') ? 'text-[#00CC33]' : 'text-[#FF4D4D]'
              }`}
            >
              {tx.amount}
            </span>
            <span className="text-[#A6A6A6] w-[80px] text-right flex-shrink-0">{tx.balance}</span>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/store')}
          className="w-full py-3 rounded-xl text-[15px] font-semibold bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00B82E] transition-colors"
        >
          충전하기
        </button>
      </div>
    </div>
  );
}
