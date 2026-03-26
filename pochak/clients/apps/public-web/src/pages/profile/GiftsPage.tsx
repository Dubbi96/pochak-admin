import { useState } from 'react';
import { SubTabChips } from './shared';

type Tab = 'received' | 'sent';

const tabs: { key: Tab; label: string }[] = [
  { key: 'received', label: '받은 선물' },
  { key: 'sent', label: '보낸 선물' },
];

interface ReceivedGift {
  id: number;
  sender: string;
  product: string;
  date: string;
  status: '미사용' | '사용완료';
}

interface SentGift {
  id: number;
  receiver: string;
  product: string;
  date: string;
  deliveryStatus: string;
}

const receivedGifts: ReceivedGift[] = [
  { id: 1, sender: '김민수', product: '프리미엄 시청권 (1개월)', date: '2026.03.20', status: '미사용' },
  { id: 2, sender: '이서연', product: '볼 5,000P', date: '2026.03.15', status: '미사용' },
  { id: 3, sender: '박지훈', product: '경기 단건 이용권', date: '2026.03.10', status: '사용완료' },
  { id: 4, sender: '최유진', product: '기프트볼 2,000P', date: '2026.03.05', status: '미사용' },
  { id: 5, sender: '정하은', product: '클럽 월간 이용권', date: '2026.02.28', status: '사용완료' },
  { id: 6, sender: '강도현', product: '볼 1,000P', date: '2026.02.20', status: '사용완료' },
];

const sentGifts: SentGift[] = [
  { id: 1, receiver: '김태희', product: '프리미엄 시청권 (1개월)', date: '2026.03.22', deliveryStatus: '수령완료' },
  { id: 2, receiver: '이준호', product: '볼 3,000P', date: '2026.03.18', deliveryStatus: '수령대기' },
  { id: 3, receiver: '박소영', product: '경기 단건 이용권', date: '2026.03.12', deliveryStatus: '수령완료' },
  { id: 4, receiver: '최민재', product: '기프트볼 1,000P', date: '2026.03.08', deliveryStatus: '수령완료' },
  { id: 5, receiver: '윤서아', product: '클럽 월간 이용권', date: '2026.03.02', deliveryStatus: '수령대기' },
];

export default function GiftsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('received');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">선물함</h1>

      <SubTabChips tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'received' ? (
        <div className="space-y-3">
          {receivedGifts.map((gift) => (
            <div
              key={gift.id}
              className="bg-[#262626] rounded-xl border border-[#4D4D4D] p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-[15px] font-semibold text-white mb-1">{gift.product}</h3>
                  <p className="text-[13px] text-[#A6A6A6]">
                    보낸 사람: <span className="text-white">{gift.sender}</span>
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                    gift.status === '미사용'
                      ? 'bg-[#00CC33]/20 text-[#00CC33]'
                      : 'bg-[#4D4D4D] text-[#A6A6A6]'
                  }`}
                >
                  {gift.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#A6A6A6]">{gift.date}</span>
                {gift.status === '미사용' && (
                  <button className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00B82E] transition-colors">
                    사용하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sentGifts.map((gift) => (
            <div
              key={gift.id}
              className="bg-[#262626] rounded-xl border border-[#4D4D4D] p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-[15px] font-semibold text-white mb-1">{gift.product}</h3>
                  <p className="text-[13px] text-[#A6A6A6]">
                    받는 사람: <span className="text-white">{gift.receiver}</span>
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                    gift.deliveryStatus === '수령대기'
                      ? 'bg-[#FF9500]/20 text-[#FF9500]'
                      : 'bg-[#4D4D4D] text-[#A6A6A6]'
                  }`}
                >
                  {gift.deliveryStatus}
                </span>
              </div>
              <span className="text-[12px] text-[#A6A6A6]">{gift.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
