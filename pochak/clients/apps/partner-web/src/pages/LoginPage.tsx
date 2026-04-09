import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { post } from '@/lib/api'

interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated()) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await post<LoginResponse>('/api/v1/auth/login', { email, password })

    if (result?.accessToken) {
      setAuth(result.accessToken, result.refreshToken ?? '', { id: '', name: email, email })
      navigate('/dashboard')
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-app)' }}>
      <div
        className="w-full rounded-2xl border"
        style={{
          maxWidth: 420,
          padding: 40,
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        <div className="text-center" style={{ marginBottom: 32 }}>
          <h1 className="text-[24px] font-bold" style={{ color: 'var(--color-pochak-primary)' }}>
            POCHAK 파트너
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-secondary)', marginTop: 8 }}>
            파트너 계정으로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="block text-[13px] font-medium" style={{ marginBottom: 6 }}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              required
              className="w-full h-10 rounded-lg border text-[14px] outline-none focus:ring-2 transition-all"
              style={{
                paddingLeft: 14,
                paddingRight: 14,
                borderColor: 'var(--color-border-default)',
                backgroundColor: 'var(--color-bg-app)',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="block text-[13px] font-medium" style={{ marginBottom: 6 }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-10 rounded-lg border text-[14px] outline-none focus:ring-2 transition-all"
              style={{
                paddingLeft: 14,
                paddingRight: 14,
                borderColor: 'var(--color-border-default)',
                backgroundColor: 'var(--color-bg-app)',
              }}
            />
          </div>

          {error && (
            <p className="text-[13px] font-medium" style={{ color: 'var(--color-pochak-error)', marginBottom: 16 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg text-white font-semibold text-[15px] transition-all"
            style={{
              backgroundColor: loading ? 'var(--color-pochak-primary-dark)' : 'var(--color-pochak-primary)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
