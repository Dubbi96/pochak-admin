import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import VenuesPage from '@/pages/VenuesPage'
import ProductsPage from '@/pages/ProductsPage'
import ReservationsPage from '@/pages/ReservationsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import ClubManagePage from '@/pages/ClubManagePage'
import ClubCustomizePage from '@/pages/ClubCustomizePage'

export default function App() {
  return (
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
        <Route path="/clubs/:id" element={<ClubManagePage />} />
        <Route path="/clubs/:id/customize" element={<ClubCustomizePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
