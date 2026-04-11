import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import VenuesPage from '@/pages/VenuesPage'
import ProductsPage from '@/pages/ProductsPage'
import ReservationsPage from '@/pages/ReservationsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import ClubManagePage from '@/pages/ClubManagePage'
import ClubEditPage from '@/pages/ClubEditPage'
import ClubCustomizePage from '@/pages/ClubCustomizePage'
import ClubMembersPage from '@/pages/ClubMembersPage'
import ClubPostsPage from '@/pages/ClubPostsPage'
import { setNavigate } from '@/lib/api'

function NavigateRegistrar() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])
  return null
}

export default function App() {
  return (
    <>
      <NavigateRegistrar />
      <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/clubs" element={<ClubManagePage />} />
        <Route path="/clubs/:id/edit" element={<ClubEditPage />} />
        <Route path="/clubs/:id/customize" element={<ClubCustomizePage />} />
        <Route path="/clubs/:id/members" element={<ClubMembersPage />} />
        <Route path="/clubs/:id/posts" element={<ClubPostsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  )
}
