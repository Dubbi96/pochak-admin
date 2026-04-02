const socialIcons: { key: string; label: string; color: string; initial: string }[] = [
  { key: 'naver', label: '네이버', color: '#03C75A', initial: 'N' },
  { key: 'youtube', label: '유튜브', color: '#FF0000', initial: 'Y' },
  { key: 'instagram', label: '인스타그램', color: '#E1306C', initial: 'I' },
  { key: 'kakao', label: '카카오', color: '#FEE500', initial: 'K' },
];

export default function SocialLinks({ links }: { links?: Record<string, string> }) {
  return (
    <div className="flex items-center gap-2">
      {socialIcons.map((social) => {
        const url = links?.[social.key];
        const Wrapper = url ? 'a' : 'span';
        return (
          <Wrapper
            key={social.key}
            {...(url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-opacity ${
              url ? 'cursor-pointer hover:opacity-80' : 'opacity-40 cursor-default'
            }`}
            style={{
              backgroundColor: social.color,
              color: social.key === 'kakao' ? '#000' : '#fff',
            }}
            title={social.label}
          >
            {social.initial}
          </Wrapper>
        );
      })}
    </div>
  );
}
