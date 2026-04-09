import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LuArrowLeft, LuSave, LuLoader, LuUsers, LuPalette } from 'react-icons/lu'
import { get, put } from '@/lib/api'

interface ClubDetail {
  teamId: number
  name: string
  shortName?: string
  logoUrl?: string
  description?: string
  sportName?: string
  sportId?: number
  customization?: {
    introText?: string
    logoUrl?: string
    bannerUrl?: string
    themeColor?: string
    socialLinksJson?: Record<string, string>
  }
}

interface FormState {
  name: string
  sportName: string
  introText: string
  logoUrl: string
  contact: string
}

export default function ClubEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [club, setClub] = useState<ClubDetail | null>(null)
  const [form, setForm] = useState<FormState>({
    name: '',
    sportName: '',
    introText: '',
    logoUrl: '',
    contact: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false)
      return
    }
    get<ClubDetail>(`/api/v1/clubs/${id}`).then((data) => {
      if (data) {
        setClub(data)
        setForm({
          name: data.name ?? '',
          sportName: data.sportName ?? '',
          introText: data.customization?.introText ?? data.description ?? '',
          logoUrl: data.customization?.logoUrl ?? data.logoUrl ?? '',
          contact: data.customization?.socialLinksJson?.contact ?? '',
        })
      }
      setLoading(false)
    })
  }, [id])

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!id || id === 'new') return
    setError(null)
    setSaving(true)
    try {
      // Update customization (introText, logoUrl, contact)
      await put(`/api/v1/clubs/${id}/customization`, {
        introText: form.introText,
        logoUrl: form.logoUrl || undefined,
        socialLinksJson: form.contact ? { contact: form.contact } : undefined,
      })
      setSaved(true)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
        <LuLoader className="w-6 h-6 animate-spin" style={{ color: 'var(--color-pochak-primary)' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate('/clubs')}
          className="flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-black/5 transition-colors"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          <LuArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-[22px] font-bold">클럽 기본 정보 편집</h1>
          {club && (
            <p className="text-[13px]" style={{ color: 'var(--color-pochak-text-muted)', marginTop: 2 }}>
              {club.name}
            </p>
          )}
        </div>
      </div>

      {/* Quick links */}
      {id && id !== 'new' && (
        <div className="flex gap-3" style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate(`/clubs/${id}/members`)}
            className="flex items-center gap-2 rounded-lg border text-[13px] font-medium px-4 py-2 transition-colors hover:bg-black/5"
            style={{ borderColor: 'var(--color-border-default)' }}
          >
            <LuUsers className="w-4 h-4" />
            멤버 관리
          </button>
          <button
            onClick={() => navigate(`/clubs/${id}/customize`)}
            className="flex items-center gap-2 rounded-lg border text-[13px] font-medium px-4 py-2 transition-colors hover:bg-black/5"
            style={{ borderColor: 'var(--color-border-default)' }}
          >
            <LuPalette className="w-4 h-4" />
            페이지 커스터마이징
          </button>
        </div>
      )}

      <div
        className="rounded-xl border"
        style={{ padding: 28, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 클럽명 */}
          <div>
            <label className="block text-[13px] font-medium" style={{ marginBottom: 6 }}>
              클럽명
            </label>
            <input
              type="text"
              value={form.name}
              disabled
              className="w-full h-10 rounded-lg border text-[14px] px-3 bg-black/[0.02] cursor-not-allowed"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-pochak-text-muted)' }}
            />
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-pochak-text-muted)' }}>
              클럽명 변경은 관리자에게 문의하세요.
            </p>
          </div>

          {/* 종목 */}
          <div>
            <label className="block text-[13px] font-medium" style={{ marginBottom: 6 }}>
              종목
            </label>
            <input
              type="text"
              value={form.sportName}
              disabled
              className="w-full h-10 rounded-lg border text-[14px] px-3 bg-black/[0.02] cursor-not-allowed"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-pochak-text-muted)' }}
            />
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-pochak-text-muted)' }}>
              종목 변경은 관리자에게 문의하세요.
            </p>
          </div>

          {/* 소개글 */}
          <div>
            <label className="block text-[13px] font-medium" style={{ marginBottom: 6 }}>
              소개글
            </label>
            <textarea
              value={form.introText}
              onChange={(e) => handleChange('introText', e.target.value)}
              rows={4}
              placeholder="클럽을 소개하는 글을 입력하세요"
              className="w-full rounded-lg border text-[14px] px-3 py-2.5 resize-none outline-none transition-colors focus:ring-2"
              style={{
                borderColor: 'var(--color-border-default)',
                backgroundColor: 'var(--color-bg-app)',
              }}
            />
          </div>

          {/* 대표이미지 URL */}
          <div>
            <label className="block text-[13px] font-medium" style={{ marginBottom: 6 }}>
              대표이미지 URL
            </label>
            <input
              type="url"
              value={form.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full h-10 rounded-lg border text-[14px] px-3 outline-none transition-colors focus:ring-2"
              style={{
                borderColor: 'var(--color-border-default)',
                backgroundColor: 'var(--color-bg-app)',
              }}
            />
            {form.logoUrl && (
              <div className="mt-2">
                <img
                  src={form.logoUrl}
                  alt="미리보기"
                  className="w-16 h-16 rounded-lg object-cover border"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-[13px] font-medium" style={{ marginBottom: 6 }}>
              연락처
            </label>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              placeholder="전화번호 또는 이메일"
              className="w-full h-10 rounded-lg border text-[14px] px-3 outline-none transition-colors focus:ring-2"
              style={{
                borderColor: 'var(--color-border-default)',
                backgroundColor: 'var(--color-bg-app)',
              }}
            />
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <p className="text-[13px] mt-4" style={{ color: 'var(--color-pochak-error)' }}>{error}</p>
        )}
        {saved && (
          <p className="text-[13px] mt-4" style={{ color: 'var(--color-pochak-primary)' }}>
            저장되었습니다. Public Web 클럽 상세 페이지에 즉시 반영됩니다.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3" style={{ marginTop: 28 }}>
          <button
            onClick={() => navigate('/clubs')}
            className="h-10 rounded-lg border text-[14px] font-medium px-5 transition-colors hover:bg-black/5"
            style={{ borderColor: 'var(--color-border-default)' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-10 rounded-lg text-white text-[14px] font-medium px-5 transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-pochak-primary)' }}
          >
            {saving ? (
              <LuLoader className="w-4 h-4 animate-spin" />
            ) : (
              <LuSave className="w-4 h-4" />
            )}
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
