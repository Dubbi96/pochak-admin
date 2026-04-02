import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubTabChips } from './shared';

type Tab = 'active' | 'expired';

const tabs: { key: Tab; label: string }[] = [
  { key: 'active', label: '사용중' },
  { key: 'expired', label: '만료' },
];

interface Ticket {
  id: number;
  name: string;
  period: string;
  status: '사용중' | '만료';
  competition: string;
  sport: string;
}

const activeTickets: Ticket[] = [
  { id: 1, name: '대가족 무제한 시청권', period: '2026.01.01 ~ 2026.12.31', status: '사용중', competition: 'K리그 2026', sport: '축구' },
  { id: 2, name: '프리미엄 경기 패스', period: '2026.03.01 ~ 2026.06.30', status: '사용중', competition: 'KBO 시즌', sport: '야구' },
  { id: 3, name: '클럽 월간 이용권', period: '2026.03.01 ~ 2026.03.31', status: '사용중', competition: 'V리그', sport: '배구' },
  { id: 4, name: '올스포츠 시즌권', period: '2026.01.15 ~ 2026.07.15', status: '사용중', competition: 'KBL 플레이오프', sport: '농구' },
];

const expiredTickets: Ticket[] = [
  { id: 5, name: '단건 경기 이용권', period: '2025.12.01 ~ 2025.12.31', status: '만료', competition: '윈터리그', sport: '축구' },
  { id: 6, name: '주말 시청권', period: '2025.11.01 ~ 2025.11.30', status: '만료', competition: 'KBO 포스트시즌', sport: '야구' },
  { id: 7, name: '이벤트 무료 이용권', period: '2025.10.15 ~ 2025.10.31', status: '만료', competition: '친선경기', sport: '배구' },
];

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const navigate = useNavigate();

  const tickets = activeTab === 'active' ? activeTickets : expiredTickets;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">이용권 관리</h1>

      <SubTabChips tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`bg-[#262626] rounded-xl border border-[#4D4D4D] p-4 ${
              ticket.status === '만료' ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-[15px] font-semibold text-white">{ticket.name}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  ticket.status === '사용중'
                    ? 'bg-[#00CC33]/20 text-[#00CC33]'
                    : 'bg-[#4D4D4D] text-[#A6A6A6]'
                }`}
              >
                {ticket.status}
              </span>
            </div>
            <p className="text-[13px] text-[#A6A6A6] mb-1">{ticket.period}</p>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-[#A6A6A6]">{ticket.competition}</span>
              <span className="text-[#4D4D4D]">|</span>
              <span className="text-[#A6A6A6]">{ticket.sport}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate('/store')}
          className="w-full py-3 rounded-xl text-[15px] font-semibold bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00B82E] transition-colors"
        >
          이용권 구매
        </button>
      </div>
    </div>
  );
}
