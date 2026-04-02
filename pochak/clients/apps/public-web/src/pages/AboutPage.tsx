export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#1A1A1A] px-6 py-10 lg:px-12">
      <h1 className="text-2xl font-bold text-white mb-8">회사소개</h1>

      {/* Company info card */}
      <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] p-8 mb-8">
        <h2 className="text-lg font-semibold text-white mb-5">주식회사 호각</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[14px]">
          {([
            ['회사명', '주식회사 호각'],
            ['대표이사', '전명섭'],
            ['사업자등록번호', '184-81-03231'],
            ['주소', '경기도 성남시 분당구 판교역로 182, 한국만도제너럴앰블리BD 2층'],
            ['고객센터', '031-778-8668'],
            ['이메일', 'help@hogak.co.kr'],
          ] as const).map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-[#A6A6A6]">{label}</dt>
              <dd className="text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Mission section */}
      <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] p-8 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          스포츠의 새로운 경험을 만듭니다
        </h2>
        <p className="text-[14px] text-[#A6A6A6] leading-relaxed">
          주식회사 호각은 스포츠를 사랑하는 모든 분들에게 새로운 시청 경험과 커뮤니티를 제공합니다.
          라이브 스트리밍, 하이라이트, 클립 등 다양한 콘텐츠를 통해 현장에 있지 않아도
          생생한 스포츠의 열기를 느낄 수 있도록 플랫폼을 운영하고 있습니다.
          포착은 아마추어부터 프로까지, 모든 스포츠 종목을 아우르는 종합 스포츠 미디어 플랫폼을 지향합니다.
        </p>
      </div>

      {/* Service section */}
      <h2 className="text-lg font-semibold text-white mb-4">서비스 소개</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: '포착 TV',
            description:
              '스포츠 경기 라이브 스트리밍과 VOD 서비스를 제공합니다. 다양한 종목의 경기를 실시간으로 시청하고, 놓친 경기도 다시 볼 수 있습니다.',
          },
          {
            title: '포착 City',
            description:
              '지역 기반의 개방형 스포츠 커뮤니티입니다. 누구나 자유롭게 참여하여 가까운 스포츠 시설 정보를 공유하고, 함께 운동할 동료를 만날 수 있습니다.',
          },
          {
            title: '포착 Club',
            description:
              '폐쇄형 스포츠 클럽 운영 서비스입니다. 팀, 동호회, 아카데미 등 조직 단위로 멤버를 관리하고 전용 콘텐츠와 일정을 운영할 수 있습니다.',
          },
        ].map((svc) => (
          <div
            key={svc.title}
            className="rounded-xl bg-[#262626] border border-[#4D4D4D] p-6"
          >
            <h3 className="text-[15px] font-semibold text-white mb-3">
              {svc.title}
            </h3>
            <p className="text-[13px] text-[#A6A6A6] leading-relaxed">
              {svc.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
