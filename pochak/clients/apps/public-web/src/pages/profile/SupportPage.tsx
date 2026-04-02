import { useState } from 'react';
import {
  Phone,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Send,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { SubTabChips } from './shared';

/* ── Types ────────────────────────────────────────────────────── */
type MainTab = 'faq' | 'inquiry' | 'history';
type FaqCategory = '전체' | '결제/구독' | '시청/재생' | '계정' | '클립' | '기타';
type InquiryCategory = '결제/구독' | '시청/재생' | '계정' | '클립' | '기타';
type InquiryStatus = '답변완료' | '답변대기';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, '전체'>;
  question: string;
  answer: string;
}

interface InquiryItem {
  id: string;
  category: InquiryCategory;
  title: string;
  date: string;
  status: InquiryStatus;
  question: string;
  answer?: string;
}

/* ── Mock FAQ data ────────────────────────────────────────────── */
const faqData: FaqItem[] = [
  { id: '1', category: '결제/구독', question: '구독을 해지하고 싶어요', answer: '마이 > 구독 관리에서 해지할 수 있습니다. 해지 후에도 결제 기간 종료일까지 이용 가능합니다.' },
  { id: '2', category: '시청/재생', question: '영상이 재생되지 않아요', answer: '네트워크 연결 상태를 확인해 주세요. Wi-Fi 환경에서 재생을 권장합니다. 문제가 지속되면 앱을 재실행하거나 캐시를 삭제해 보세요.' },
  { id: '3', category: '결제/구독', question: '결제 수단을 변경하고 싶어요', answer: '마이 > 구독 관리 > 결제 수단 변경에서 신용카드, 체크카드, 간편결제 등으로 변경할 수 있습니다.' },
  { id: '4', category: '계정', question: '비밀번호를 잊어버렸어요', answer: '로그인 화면에서 "비밀번호 찾기"를 선택하세요. 가입 시 등록한 이메일로 비밀번호 재설정 링크를 보내드립니다.' },
  { id: '5', category: '클립', question: '클립은 어떻게 만드나요?', answer: '영상 시청 중 클립 버튼을 눌러 원하는 구간을 선택하면 클립이 생성됩니다. 생성된 클립은 마이 > 내 클립에서 확인할 수 있습니다.' },
  { id: '6', category: '시청/재생', question: '화질을 변경할 수 있나요?', answer: '영상 재생 중 설정(톱니바퀴) 아이콘을 눌러 화질을 선택할 수 있습니다. 자동, 1080p, 720p, 480p 중 선택 가능합니다.' },
  { id: '7', category: '계정', question: '회원 탈퇴는 어떻게 하나요?', answer: '설정 > 계정 관리 > 회원 탈퇴에서 진행할 수 있습니다. 탈퇴 시 모든 데이터가 삭제되며 복구가 불가능합니다. 구독 중인 경우 먼저 해지해 주세요.' },
  { id: '8', category: '결제/구독', question: '환불 정책이 어떻게 되나요?', answer: '구독 결제 후 7일 이내 이용 내역이 없는 경우 전액 환불이 가능합니다. 마이 > 구독 관리에서 환불을 신청하거나 고객센터로 문의해 주세요.' },
  { id: '9', category: '기타', question: '포착 시티와 포착 클럽의 차이점은 무엇인가요?', answer: '포착 시티는 누구나 자유롭게 참여할 수 있는 개방형 단체이고, 포착 클럽은 승인이 필요한 폐쇄형 단체입니다. 클럽은 가입 신청 후 관리자 승인을 받아야 합니다.' },
  { id: '10', category: '시청/재생', question: '동시 시청은 몇 명까지 가능한가요?', answer: '기본 구독의 경우 최대 2대의 기기에서 동시 시청이 가능합니다. 프리미엄 구독은 최대 4대까지 지원합니다.' },
  { id: '11', category: '클립', question: '클립 공유는 어떻게 하나요?', answer: '클립 상세 페이지에서 공유 버튼을 누르면 카카오톡, URL 복사, SNS 공유 등을 선택할 수 있습니다.' },
  { id: '12', category: '기타', question: '앱이 지원하는 기기와 OS 버전은?', answer: 'iOS 15.0 이상, Android 10 이상을 지원합니다. 웹 브라우저는 Chrome, Safari, Edge 최신 버전을 권장합니다.' },
];

/* ── Mock inquiry history ─────────────────────────────────────── */
const inquiryHistory: InquiryItem[] = [
  { id: '1', category: '결제/구독', title: '구독 요금제 변경 관련 문의', date: '2026.01.15', status: '답변완료', question: '현재 기본 요금제를 사용 중인데 프리미엄으로 변경하면 기존 결제 금액은 어떻게 처리되나요?', answer: '안녕하세요, 포착 고객센터입니다. 요금제 변경 시 기존 결제 잔여일은 일할 계산되어 차액만 추가 결제됩니다. 마이 > 구독 관리에서 변경 가능합니다. 감사합니다.' },
  { id: '2', category: '시청/재생', title: '특정 영상 버퍼링 문제', date: '2026.01.10', status: '답변완료', question: '홈 화면의 특정 VOD 영상에서 계속 버퍼링이 발생합니다. 다른 영상은 잘 재생됩니다.', answer: '안녕하세요, 해당 영상의 인코딩 오류를 확인하여 수정 완료했습니다. 현재 정상 재생되는지 확인 부탁드립니다. 불편을 드려 죄송합니다.' },
  { id: '3', category: '계정', title: '소셜 로그인 연동 해제 문의', date: '2026.01.18', status: '답변대기', question: 'Google 계정으로 로그인 중인데 카카오 로그인으로 변경하고 싶습니다. 연동 해제 방법을 알려주세요.' },
  { id: '4', category: '클립', title: '클립 저장 오류', date: '2026.01.20', status: '답변대기', question: '클립 생성 시 "저장에 실패했습니다" 오류가 발생합니다. 여러 번 시도했지만 동일합니다.' },
];

/* ── Sub-components ───────────────────────────────────────────── */
const mainTabs: { key: MainTab; label: string }[] = [
  { key: 'faq', label: 'FAQ' },
  { key: 'inquiry', label: '1:1 문의' },
  { key: 'history', label: '문의내역' },
];

const faqCategoryTabs: { key: FaqCategory; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: '결제/구독', label: '결제/구독' },
  { key: '시청/재생', label: '시청/재생' },
  { key: '계정', label: '계정' },
  { key: '클립', label: '클립' },
  { key: '기타', label: '기타' },
];

const inquiryCategories: InquiryCategory[] = ['결제/구독', '시청/재생', '계정', '클립', '기타'];

/* ── Main component ───────────────────────────────────────────── */
export default function SupportPage() {
  const [mainTab, setMainTab] = useState<MainTab>('faq');
  const [faqCategory, setFaqCategory] = useState<FaqCategory>('전체');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    category: '' as InquiryCategory | '',
    title: '',
    content: '',
    file: null as File | null,
  });

  const filteredFaq =
    faqCategory === '전체'
      ? faqData
      : faqData.filter((f) => f.category === faqCategory);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">고객센터</h1>

      {/* Quick contact info */}
      <div className="bg-[#262626] rounded-xl p-5 mb-6 flex flex-wrap gap-6">
        <a
          href="tel:031-778-8668"
          className="flex items-center gap-2 text-[14px] text-[#A6A6A6] hover:text-white transition-colors"
        >
          <Phone className="h-4 w-4 text-[#00CC33]" />
          <span className="font-semibold text-white">031-778-8668</span>
        </a>
        <a
          href="mailto:help@hogak.co.kr"
          className="flex items-center gap-2 text-[14px] text-[#A6A6A6] hover:text-white transition-colors"
        >
          <Mail className="h-4 w-4 text-[#00CC33]" />
          <span className="font-semibold text-white">help@hogak.co.kr</span>
        </a>
        <div className="flex items-center gap-2 text-[14px] text-[#A6A6A6]">
          <Clock className="h-4 w-4 text-[#00CC33]" />
          <span>평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)</span>
        </div>
      </div>

      {/* Main tabs */}
      <SubTabChips tabs={mainTabs} active={mainTab} onChange={setMainTab} />

      {/* ── FAQ tab ──────────────────────────────────────────────── */}
      {mainTab === 'faq' && (
        <div>
          <SubTabChips tabs={faqCategoryTabs} active={faqCategory} onChange={setFaqCategory} />

          <div className="flex flex-col divide-y divide-[#4D4D4D]">
            {filteredFaq.map((faq) => {
              const isOpen = expandedFaqId === faq.id;
              return (
                <div key={faq.id} className="py-4">
                  <button
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center gap-3 text-left group"
                  >
                    <HelpCircle className="h-4 w-4 text-[#00CC33] shrink-0" />
                    <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold text-white bg-[#333333]">
                      {faq.category}
                    </span>
                    <span className="flex-1 text-[15px] text-white group-hover:text-[#00CC33] transition-colors">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#A6A6A6] shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#A6A6A6] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-3 ml-[52px] mr-8 p-4 bg-[#262626] rounded-lg text-[14px] text-[#A6A6A6] leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredFaq.length === 0 && (
            <p className="text-center text-[#A6A6A6] py-12">해당 카테고리의 FAQ가 없습니다.</p>
          )}
        </div>
      )}

      {/* ── 1:1 문의 tab ────────────────────────────────────────── */}
      {mainTab === 'inquiry' && (
        <div className="max-w-[600px]">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-[#00CC33]" />
            <p className="text-[14px] text-[#A6A6A6]">
              문의하신 내용은 영업일 기준 1~2일 이내에 답변 드리겠습니다.
            </p>
          </div>

          <div className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-[13px] text-[#A6A6A6] mb-2">문의 유형</label>
              <select
                value={inquiryForm.category}
                onChange={(e) =>
                  setInquiryForm((f) => ({ ...f, category: e.target.value as InquiryCategory }))
                }
                className="w-full bg-[#262626] border border-[#4D4D4D] rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-[#00CC33] transition-colors appearance-none"
              >
                <option value="" disabled>
                  유형을 선택해 주세요
                </option>
                {inquiryCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[13px] text-[#A6A6A6] mb-2">제목</label>
              <input
                type="text"
                value={inquiryForm.title}
                onChange={(e) => setInquiryForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="문의 제목을 입력해 주세요"
                className="w-full bg-[#262626] border border-[#4D4D4D] rounded-lg px-4 py-3 text-[14px] text-white placeholder-[#666666] outline-none focus:border-[#00CC33] transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-[13px] text-[#A6A6A6] mb-2">문의 내용</label>
              <textarea
                value={inquiryForm.content}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setInquiryForm((f) => ({ ...f, content: e.target.value }));
                  }
                }}
                placeholder="문의 내용을 입력해 주세요"
                rows={6}
                className="w-full bg-[#262626] border border-[#4D4D4D] rounded-lg px-4 py-3 text-[14px] text-white placeholder-[#666666] outline-none focus:border-[#00CC33] transition-colors resize-none"
              />
              <p className="text-right text-[12px] text-[#A6A6A6] mt-1">
                {inquiryForm.content.length} / 1,000
              </p>
            </div>

            {/* File attachment */}
            <div>
              <label className="block text-[13px] text-[#A6A6A6] mb-2">첨부파일 (선택)</label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#262626] border border-[#4D4D4D] rounded-lg text-[13px] text-[#A6A6A6] hover:text-white hover:border-[#00CC33] transition-colors cursor-pointer">
                <Paperclip className="h-4 w-4" />
                <span>{inquiryForm.file ? inquiryForm.file.name : '파일 선택'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setInquiryForm((f) => ({ ...f, file }));
                  }}
                />
              </label>
            </div>

            {/* Submit */}
            <button
              onClick={() => {
                alert('문의가 등록되었습니다. 빠른 시일 내에 답변 드리겠습니다.');
                setInquiryForm({ category: '', title: '', content: '', file: null });
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#00CC33] hover:bg-[#00B82E] text-[#1A1A1A] font-semibold py-3 rounded-lg transition-colors text-[15px]"
            >
              <Send className="h-4 w-4" />
              문의하기
            </button>
          </div>
        </div>
      )}

      {/* ── 문의내역 tab ─────────────────────────────────────────── */}
      {mainTab === 'history' && (
        <div>
          {inquiryHistory.length === 0 ? (
            <p className="text-center text-[#A6A6A6] py-12">문의 내역이 없습니다.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[#4D4D4D]">
              {inquiryHistory.map((item) => {
                const isOpen = expandedHistoryId === item.id;
                return (
                  <div key={item.id} className="py-4">
                    <button
                      onClick={() => setExpandedHistoryId(isOpen ? null : item.id)}
                      className="w-full flex items-center gap-3 text-left group"
                    >
                      {/* Category badge */}
                      <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold text-white bg-[#333333]">
                        {item.category}
                      </span>

                      {/* Title */}
                      <span className="flex-1 text-[15px] text-white group-hover:text-[#00CC33] transition-colors truncate">
                        {item.title}
                      </span>

                      {/* Status */}
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.status === '답변완료'
                            ? 'bg-[#00CC33]/20 text-[#00CC33]'
                            : 'bg-[#FF6D00]/20 text-[#FF6D00]'
                        }`}
                      >
                        {item.status}
                      </span>

                      {/* Date */}
                      <span className="shrink-0 text-[13px] text-[#A6A6A6] min-w-[80px] text-right">
                        {item.date}
                      </span>

                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-[#A6A6A6] shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#A6A6A6] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="mt-3 ml-4 mr-8 space-y-3">
                        {/* Question */}
                        <div className="p-4 bg-[#262626] rounded-lg">
                          <p className="text-[12px] text-[#A6A6A6] mb-2 font-semibold">문의 내용</p>
                          <p className="text-[14px] text-white leading-relaxed">{item.question}</p>
                        </div>
                        {/* Answer */}
                        {item.answer ? (
                          <div className="p-4 bg-[#1F2E1F] rounded-lg border border-[#00CC33]/20">
                            <p className="text-[12px] text-[#00CC33] mb-2 font-semibold">답변</p>
                            <p className="text-[14px] text-[#A6A6A6] leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-[#2E2A1F] rounded-lg border border-[#FF6D00]/20">
                            <p className="text-[12px] text-[#FF6D00] font-semibold">
                              답변 대기 중입니다. 영업일 기준 1~2일 이내에 답변 드리겠습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
