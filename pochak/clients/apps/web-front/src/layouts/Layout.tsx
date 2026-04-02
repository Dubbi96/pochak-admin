import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSidebar } from '@/contexts/SidebarContext';

const NO_FOOTER_ROUTES = ['/clip/', '/clip/editor'];

export default function Layout() {
  const { expanded } = useSidebar();
  const { pathname } = useLocation();
  const sidebarWidth = expanded ? 216 : 64;
  const hideFooter = NO_FOOTER_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <Sidebar />
      <main
        className="flex flex-col transition-[margin-left] duration-200 overflow-x-hidden"
        style={{
          marginLeft: sidebarWidth,
          paddingTop: 56,
          minHeight: '100vh',
        }}
      >
        <div
          className={`flex-1 ${hideFooter ? 'py-0' : 'py-6'} px-6 lg:px-8`}
          style={{ maxWidth: 1920, width: '100%' }}
        >
          <Outlet />
        </div>
        {!hideFooter && <Footer />}
      </main>
    </div>
  );
}
