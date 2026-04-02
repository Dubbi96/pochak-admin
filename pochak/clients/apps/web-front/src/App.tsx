import { Routes, Route } from 'react-router-dom'
import Layout from '@/layouts/Layout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import FindIdPage from '@/pages/FindIdPage'
import SignupPage from '@/pages/SignupPage'
import PlayerPage from '@/pages/PlayerPage'
import ContentListPage from '@/pages/ContentListPage'
import SearchPage from '@/pages/SearchPage'
import MyPage from '@/pages/MyPage'
import SchedulePage from '@/pages/SchedulePage'
import TeamDetailPage from '@/pages/TeamDetailPage'
import TeamsPage from '@/pages/TeamsPage'
import CompetitionDetailPage from '@/pages/CompetitionDetailPage'
import CompetitionListPage from '@/pages/CompetitionListPage'
import CityPage from '@/pages/CityPage'
import ClubPage from '@/pages/ClubPage'
import VenueDetailPage from '@/pages/VenueDetailPage'
import StorePage from '@/pages/StorePage'
import NotificationsPage from '@/pages/NotificationsPage'
import SettingsPage from '@/pages/SettingsPage'
import NoticesPage from '@/pages/NoticesPage'
import SupportPage from '@/pages/SupportPage'
import AboutPage from '@/pages/AboutPage'
import PartnershipPage from '@/pages/PartnershipPage'
import TermsPage from '@/pages/TermsPage'
import SubscriptionPage from '@/pages/SubscriptionPage'
import ClipEditorPage from '@/pages/ClipEditorPage'
import ClipPlayerPage from '@/pages/ClipPlayerPage'
import ProfilePage from '@/pages/ProfilePage'
import StoreDetailPage from '@/pages/StoreDetailPage'
import ClubManagerPage from '@/pages/ClubManagerPage'
import CheckoutPage from '@/pages/CheckoutPage'
import RecordingPage from '@/pages/RecordingPage'
import MyReservationsPage from '@/pages/MyReservationsPage'
import MyRecordingsPage from '@/pages/MyRecordingsPage'

export default function App() {
  return (
    <Routes>
      {/* Auth (no layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/find-id" element={<FindIdPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Main (with layout) */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/contents" element={<ContentListPage />} />
        <Route path="/contents/:type/:id" element={<PlayerPage />} />
        <Route path="/clip/editor" element={<ClipEditorPage />} />
        <Route path="/clip/:id" element={<ClipPlayerPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/team/:id" element={<TeamDetailPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/competition" element={<CompetitionListPage />} />
        <Route path="/competition/:id" element={<CompetitionDetailPage />} />
        <Route path="/city" element={<CityPage />} />
        <Route path="/city/venue/:id" element={<VenueDetailPage />} />
        <Route path="/club" element={<ClubPage />} />
        <Route path="/club/manage/:id" element={<ClubManagerPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/store/:id" element={<StoreDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/partnership" element={<PartnershipPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/my/reservations" element={<MyReservationsPage />} />
        <Route path="/my/recordings" element={<MyRecordingsPage />} />
        <Route path="/recording/:sessionId" element={<RecordingPage />} />
      </Route>
    </Routes>
  )
}
