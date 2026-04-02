import { Routes, Route, Outlet } from 'react-router-dom'
import { ToastProvider } from '@/components/ToastProvider'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import TVHomePage from '@/pages/TVHomePage'
import SchedulePage from '@/pages/SchedulePage'
import LoginPage from '@/pages/LoginPage'
import ContentPlayerPage from '@/pages/ContentPlayerPage'
import ContentListPage from '@/pages/ContentListPage'
import SearchPage from '@/pages/SearchPage'
import MyPage from '@/pages/MyPage'
import SignUpPage from '@/pages/SignUpPage'
import CompetitionPage from '@/pages/CompetitionPage'
import ClubPage from '@/pages/ClubPage'
import TeamPage from '@/pages/TeamPage'
import StorePage from '@/pages/StorePage'
import SettingsPage from '@/pages/SettingsPage'
import AccountInfoPage from '@/pages/AccountInfoPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import AuthLinkPage from '@/pages/AuthLinkPage'
import NotificationPage from '@/pages/NotificationPage'
import CompetitionInvitePage from '@/pages/CompetitionInvitePage'
import CompetitionListPage from '@/pages/CompetitionListPage'
import TeamListPage from '@/pages/TeamListPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AboutPage from '@/pages/AboutPage'
import PartnershipPage from '@/pages/PartnershipPage'
import TermsPage from '@/pages/TermsPage'
import FindIdPage from '@/pages/FindIdPage'
import CityPage from '@/pages/CityPage'
import CommunityPublicPage from '@/pages/CommunityPage'
import ManagerRoute from '@/components/ManagerRoute'
import ManageDashboard from '@/pages/manage/ManageDashboard'
import ManageNoticesPage from '@/pages/manage/ManageNoticesPage'
import CreateNoticePage from '@/pages/manage/CreateNoticePage'
import ManageMembersPage from '@/pages/manage/ManageMembersPage'
import ManageContentPage from '@/pages/manage/ManageContentPage'
import ProfileLayout from '@/layouts/ProfileLayout'
import WatchHistoryPage from '@/pages/profile/WatchHistoryPage'
import MyClipsPage from '@/pages/profile/MyClipsPage'
import ReservationPage from '@/pages/profile/ReservationPage'
import FavoritesPage from '@/pages/profile/FavoritesPage'
import JoinedClubsPage from '@/pages/profile/JoinedClubsPage'
import InterestedClubsPage from '@/pages/profile/InterestedClubsPage'
import CommunityPage from '@/pages/profile/CommunityPage'
import CompetitionNewsPage from '@/pages/profile/CompetitionNewsPage'
import FacilityReservationPage from '@/pages/profile/FacilityReservationPage'
import FrequentFacilitiesPage from '@/pages/profile/FrequentFacilitiesPage'
import NoticesPage from '@/pages/profile/NoticesPage'
import SupportPage from '@/pages/profile/SupportPage'
import PointsPage from '@/pages/profile/PointsPage'
import TicketsPage from '@/pages/profile/TicketsPage'
import GiftsPage from '@/pages/profile/GiftsPage'

export default function App() {
  return (
    <ToastProvider>
    <div className="min-h-screen font-sans antialiased bg-[#1A1A1A]">
      {/* GNB — fixed top */}
      <Header />

      {/* LNB — fixed left */}
      <Sidebar />

      {/* Main content: offset by GNB(70px) + LNB(240px) */}
      <main className="pt-[70px] lg:pl-[240px] min-h-screen">
        <Routes>
          {/* Main home = TV Home (Frame 1) */}
          <Route path="/" element={<TVHomePage />} />
          <Route path="/home" element={<TVHomePage />} />

          {/* LNB pages */}
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/my" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />

          {/* City / Community top-level pages */}
          <Route path="/city" element={<CityPage />} />
          <Route path="/community" element={<CommunityPublicPage />} />

          {/* Competition invite (deep-link) */}
          <Route path="/competition/invite/:inviteCode" element={<CompetitionInvitePage />} />

          {/* TV service sub-pages */}
          <Route path="/tv/competition/:competitionId" element={<CompetitionPage />} />

          {/* Content pages */}
          <Route path="/contents/:type/:id" element={<ContentPlayerPage />} />
          <Route path="/content/:contentType/:contentId" element={<ContentPlayerPage />} />
          <Route path="/clip/:contentId" element={<ContentPlayerPage />} />
          <Route path="/contents" element={<ContentListPage />} />
          <Route path="/competitions" element={<CompetitionListPage />} />
          <Route path="/teams" element={<TeamListPage />} />

          {/* Other pages */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/team/:teamId" element={<TeamPage />} />
          <Route path="/club/:clubId" element={<ClubPage />} />

          {/* Profile area — shared ProfileSidebar layout */}
          <Route element={<ProtectedRoute><ProfileLayout /></ProtectedRoute>}>
            <Route path="/store" element={<StorePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/account" element={<AccountInfoPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/my/history" element={<WatchHistoryPage />} />
            <Route path="/my/clips" element={<MyClipsPage />} />
            <Route path="/my/reservations" element={<ReservationPage />} />
            <Route path="/my/favorites" element={<FavoritesPage />} />
            <Route path="/my/clubs" element={<JoinedClubsPage />} />
            <Route path="/my/interest-clubs" element={<InterestedClubsPage />} />
            <Route path="/my/community" element={<CommunityPage />} />
            <Route path="/my/competitions" element={<CompetitionNewsPage />} />
            <Route path="/my/facility" element={<FacilityReservationPage />} />
            <Route path="/my/favorite-facility" element={<FrequentFacilitiesPage />} />
            <Route path="/my/points" element={<PointsPage />} />
            <Route path="/my/tickets" element={<TicketsPage />} />
            <Route path="/my/gifts" element={<GiftsPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/support" element={<SupportPage />} />
          </Route>

          {/* Manager / Admin area */}
          <Route element={<ManagerRoute><Outlet /></ManagerRoute>}>
            <Route path="/manage" element={<ManageDashboard />} />
            <Route path="/manage/notices" element={<ManageNoticesPage />} />
            <Route path="/manage/notices/create" element={<CreateNoticePage />} />
            <Route path="/manage/members" element={<ManageMembersPage />} />
            <Route path="/manage/content" element={<ManageContentPage />} />
          </Route>

          <Route path="/about" element={<AboutPage />} />
          <Route path="/partnership" element={<PartnershipPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/find-id" element={<FindIdPage />} />
          <Route path="/find-password" element={<FindIdPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/link" element={<AuthLinkPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </main>
    </div>
    </ToastProvider>
  )
}
