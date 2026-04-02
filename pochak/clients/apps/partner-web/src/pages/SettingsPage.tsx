import { useAuthStore } from '@/stores/authStore'

export default function SettingsPage() {
  const { partner } = useAuthStore()

  return (
    <div>
      <h1 className="text-[22px] font-bold" style={{ marginBottom: 24 }}>설정</h1>

      <div className="rounded-xl border" style={{ padding: 24, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
        <h2 className="text-[16px] font-semibold" style={{ marginBottom: 16 }}>파트너 정보</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="block text-[13px] font-medium" style={{ color: 'var(--color-pochak-text-secondary)', marginBottom: 4 }}>
              이름
            </label>
            <p className="text-[15px]">{partner?.name || '—'}</p>
          </div>
          <div>
            <label className="block text-[13px] font-medium" style={{ color: 'var(--color-pochak-text-secondary)', marginBottom: 4 }}>
              이메일
            </label>
            <p className="text-[15px]">{partner?.email || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
