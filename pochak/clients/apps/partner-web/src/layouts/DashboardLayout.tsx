import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import {
  LuLayoutDashboard, LuMapPin, LuPackage, LuCalendarCheck,
  LuTrendingUp, LuSettings, LuLogOut, LuMenu,
} from 'react-icons/lu'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { label: '대시보드', path: '/dashboard', icon: LuLayoutDashboard },
  { label: '시설 관리', path: '/venues', icon: LuMapPin },
  { label: '상품 관리', path: '/products', icon: LuPackage },
  { label: '예약 관리', path: '/reservations', icon: LuCalendarCheck },
  { label: '통계', path: '/analytics', icon: LuTrendingUp },
  { label: '설정', path: '/settings', icon: LuSettings },
]

export default function DashboardLayout() {
  const { partner, logout, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg-app)' }}>
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-40 border-r flex flex-col transition-all duration-200"
        style={{
          width: sidebarOpen ? 240 : 64,
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center h-14 border-b" style={{ borderColor: 'var(--color-border-subtle)', padding: '0 16px', gap: 12 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5">
            <LuMenu className="w-5 h-5" />
          </button>
          {sidebarOpen && (
            <span className="text-[15px] font-bold" style={{ color: 'var(--color-pochak-primary)' }}>
              POCHAK 파트너
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col" style={{ padding: '8px 8px', gap: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center rounded-lg transition-colors"
                style={{
                  height: 40,
                  padding: sidebarOpen ? '0 12px' : '0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  gap: 10,
                  backgroundColor: active ? 'rgba(16, 185, 92, 0.08)' : 'transparent',
                  color: active ? 'var(--color-pochak-primary)' : 'var(--color-pochak-text-secondary)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                }}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="border-t" style={{ borderColor: 'var(--color-border-subtle)', padding: 12 }}>
          {sidebarOpen && partner && (
            <div style={{ marginBottom: 8, padding: '0 4px' }}>
              <p className="text-[13px] font-medium truncate">{partner.name}</p>
              <p className="text-[12px] truncate" style={{ color: 'var(--color-pochak-text-muted)' }}>{partner.email}</p>
            </div>
          )}
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="flex items-center w-full rounded-lg hover:bg-black/5 transition-colors"
            style={{
              height: 36,
              padding: sidebarOpen ? '0 12px' : '0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--color-pochak-text-secondary)',
            }}
          >
            <LuLogOut className="w-4 h-4" />
            {sidebarOpen && <span>로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 transition-[margin-left] duration-200"
        style={{ marginLeft: sidebarOpen ? 240 : 64 }}
      >
        <div style={{ padding: '24px 32px', maxWidth: 1400 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
