import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { LuSave, LuImage, LuLink, LuCheck } from 'react-icons/lu'
import { get, post } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface Customization {
  bannerUrl?: string
  logoUrl?: string
  themeColor?: string
  introText?: string
  socialLinksJson?: Record<string, string>
}

const THEME_PRESETS = [
  '#00CC33',
  '#3B82F6',
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
]

export default function ClubCustomizePage() {
  const { id: clubId } = useParams<{ id: string }>()
  const { partner } = useAuthStore()
  const partnerId = partner?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [bannerUrl, setBannerUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [themeColor, setThemeColor] = useState('#00CC33')
  const [introText, setIntroText] = useState('')
  const [instagram, setInstagram] = useState('')
  const [youtube, setYoutube] = useState('')
  const [kakao, setKakao] = useState('')

  useEffect(() => {
    if (!clubId || !partnerId) {
      setLoading(false)
      return
    }
    get<Customization>(`/api/v1/partner/partners/${partnerId}/clubs/${clubId}/customization`).then((data) => {
      if (data) {
        setBannerUrl(data.bannerUrl ?? '')
        setLogoUrl(data.logoUrl ?? '')
        setThemeColor(data.themeColor ?? '#00CC33')
        setIntroText(data.introText ?? '')
        setInstagram(data.socialLinksJson?.instagram ?? '')
        setYoutube(data.socialLinksJson?.youtube ?? '')
        setKakao(data.socialLinksJson?.kakao ?? '')
      }
      setLoading(false)
    })
  }, [clubId, partnerId])

  const handleSave = async () => {
    if (!clubId || !partnerId || saving) return
    setSaving(true)
    setSaved(false)
    const body = {
      partnerId: Number(partnerId),
      bannerUrl: bannerUrl || null,
      logoUrl: logoUrl || null,
      themeColor,
      introText: introText || null,
      socialLinksJson: {
        ...(instagram && { instagram }),
        ...(youtube && { youtube }),
        ...(kakao && { kakao }),
      },
    }
    await post(`/api/v1/clubs/${clubId}/customization`, body)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-pochak-text-muted)' }}>
        불러오는 중...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
        <h1 className="text-[22px] font-bold">클럽 페이지 커스터마이징</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center rounded-lg text-white text-[14px] font-medium transition-colors"
          style={{ height: 40, padding: '0 16px', gap: 6, backgroundColor: saved ? 'var(--color-pochak-primary)' : 'var(--color-pochak-primary)', opacity: saving ? 0.6 : 1 }}
        >
          {saved ? <LuCheck className="w-4 h-4" /> : <LuSave className="w-4 h-4" />}
          {saving ? '저장 중...' : saved ? '저장됨' : '저장'}
        </button>
      </div>

      {/* Theme color */}
      <section style={{ marginBottom: 28 }}>
        <h2 className="text-[15px] font-semibold" style={{ marginBottom: 12, color: 'var(--color-pochak-text)' }}>
          테마 색상
        </h2>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {THEME_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setThemeColor(color)}
              className="w-9 h-9 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
              style={{ backgroundColor: color, outline: themeColor === color ? `3px solid ${color}` : 'none', outlineOffset: 2 }}
            >
              {themeColor === color && <LuCheck className="w-4 h-4 text-white" />}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-9 h-9 rounded-full cursor-pointer border-0"
              title="커스텀 색상"
            />
            <span className="text-[13px]" style={{ color: 'var(--color-pochak-text-muted)', fontFamily: 'monospace' }}>{themeColor}</span>
          </div>
        </div>
      </section>

      {/* Banner image */}
      <section style={{ marginBottom: 28 }}>
        <h2 className="text-[15px] font-semibold" style={{ marginBottom: 8, color: 'var(--color-pochak-text)' }}>
          배너 이미지 URL <span className="text-[13px] font-normal" style={{ color: 'var(--color-pochak-text-muted)' }}>권장 1200×400px</span>
        </h2>
        <div className="flex items-center rounded-lg border gap-2" style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', padding: '0 14px', height: 44 }}>
          <LuImage className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-pochak-text-muted)' }} />
          <input
            type="url"
            placeholder="https://..."
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            className="flex-1 h-full text-[14px] outline-none bg-transparent"
          />
        </div>
        {bannerUrl && (
          <div className="mt-3 rounded-xl overflow-hidden" style={{ aspectRatio: '3/1', maxHeight: 160, backgroundColor: 'var(--color-bg-surface)' }}>
            <img src={bannerUrl} alt="배너 미리보기" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
        )}
      </section>

      {/* Logo image */}
      <section style={{ marginBottom: 28 }}>
        <h2 className="text-[15px] font-semibold" style={{ marginBottom: 8, color: 'var(--color-pochak-text)' }}>
          로고 이미지 URL <span className="text-[13px] font-normal" style={{ color: 'var(--color-pochak-text-muted)' }}>권장 200×200px</span>
        </h2>
        <div className="flex items-center rounded-lg border gap-2" style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', padding: '0 14px', height: 44 }}>
          <LuImage className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-pochak-text-muted)' }} />
          <input
            type="url"
            placeholder="https://..."
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="flex-1 h-full text-[14px] outline-none bg-transparent"
          />
        </div>
        {logoUrl && (
          <img src={logoUrl} alt="로고 미리보기" className="mt-3 w-16 h-16 rounded-xl object-cover" style={{ backgroundColor: 'var(--color-bg-surface)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
      </section>

      {/* Intro text */}
      <section style={{ marginBottom: 28 }}>
        <h2 className="text-[15px] font-semibold" style={{ marginBottom: 8, color: 'var(--color-pochak-text)' }}>
          소개글
        </h2>
        <textarea
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          placeholder="클럽 소개글을 입력하세요"
          rows={5}
          className="w-full rounded-lg border text-[14px] outline-none bg-transparent resize-none"
          style={{ padding: '12px 14px', borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-pochak-text)' }}
        />
      </section>

      {/* Social links */}
      <section style={{ marginBottom: 28 }}>
        <h2 className="text-[15px] font-semibold" style={{ marginBottom: 12, color: 'var(--color-pochak-text)' }}>
          소셜 링크
        </h2>
        {[
          { label: '인스타그램', placeholder: 'https://instagram.com/...', value: instagram, onChange: setInstagram },
          { label: '유튜브', placeholder: 'https://youtube.com/...', value: youtube, onChange: setYoutube },
          { label: '카카오', placeholder: 'https://open.kakao.com/...', value: kakao, onChange: setKakao },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3" style={{ marginBottom: 10 }}>
            <span className="text-[14px] w-20 flex-shrink-0" style={{ color: 'var(--color-pochak-text-muted)' }}>{item.label}</span>
            <div className="flex-1 flex items-center rounded-lg border gap-2" style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', padding: '0 12px', height: 40 }}>
              <LuLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-pochak-text-muted)' }} />
              <input
                type="url"
                placeholder={item.placeholder}
                value={item.value}
                onChange={(e) => item.onChange(e.target.value)}
                className="flex-1 h-full text-[14px] outline-none bg-transparent"
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
