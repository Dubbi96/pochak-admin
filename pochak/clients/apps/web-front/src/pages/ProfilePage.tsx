import { LuPencil, LuChevronRight } from 'react-icons/lu';
import ProfileSidebar from '@/components/ProfileSidebar';
import { Button } from '@/components/ui/button';

const personalInfo = [
  { label: '이름', value: '홍길동' },
  { label: '생년월일', value: '2000.01.01' },
  { label: '휴대폰번호', value: '010-0000-0000' },
  { label: '이메일', value: 'kimpochak@hogak.co.kr', editable: true },
];

const additionalInfo = [
  { label: '관심지역', value: '대한민국 서울시, 대한민국 성남시, 대한민국 용인시', editable: true },
  { label: '관심종목', value: '축구, 마라톤, 유도', editable: true },
  { label: '서비스이용계기', value: '내 경기영상을 보고 싶어요!', editable: true },
];

export default function ProfilePage() {
  return (
    <div className="flex gap-8">
      <ProfileSidebar />
      <div className="flex-1 min-w-0 max-w-[620px]">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="size-[80px] rounded-full bg-card flex items-center justify-center border border-border-subtle">
            <img src="/pochak-icon.svg" alt="프로필" className="w-10 h-10" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-foreground">pochak2026</h1>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <LuPencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <button className="flex items-center justify-between w-full px-1 py-4 border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
          <span className="text-[15px] font-semibold text-foreground">비밀번호 변경</span>
          <LuChevronRight className="w-4 h-4 text-pochak-text-tertiary" />
        </button>

        {/* 개인정보 */}
        <section className="mt-6">
          <h2 className="text-[16px] font-bold text-foreground mb-4">개인정보</h2>
          <div className="flex flex-col">
            {personalInfo.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-1 py-3.5 border-b border-border-subtle"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-muted-foreground">{item.label}</span>
                  <span className="text-[15px] text-foreground">{item.value}</span>
                </div>
                {item.editable && (
                  <button className="text-pochak-text-tertiary hover:text-foreground transition-colors">
                    <LuChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 추가정보 */}
        <section className="mt-8">
          <h2 className="text-[16px] font-bold text-foreground mb-4">추가정보</h2>
          <div className="flex flex-col">
            {additionalInfo.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-1 py-3.5 border-b border-border-subtle"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-muted-foreground">{item.label}</span>
                  <span className="text-[15px] text-foreground">{item.value}</span>
                </div>
                {item.editable && (
                  <button className="text-pochak-text-tertiary hover:text-foreground transition-colors">
                    <LuChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 회원탈퇴 */}
        <div className="mt-10 mb-6">
          <Button
            variant="outline"
            className="border-border-subtle text-muted-foreground hover:text-foreground hover:border-white/[0.2] hover:bg-white/[0.04]"
          >
            회원탈퇴
          </Button>
        </div>
      </div>
    </div>
  );
}
