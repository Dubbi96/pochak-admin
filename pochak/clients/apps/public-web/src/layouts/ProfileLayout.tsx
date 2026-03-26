import { Outlet, useLocation } from 'react-router-dom';
import ProfileSidebar from '@/components/ProfileSidebar';

export default function ProfileLayout() {
  const location = useLocation();
  // Use pathname for activePath highlighting
  const activePath = location.pathname + location.search;

  return (
    <div className="flex gap-6 px-6 py-8">
      {/* Sidebar: sticky, never remounts */}
      <div className="hidden lg:block sticky top-[86px] self-start">
        <ProfileSidebar activePath={activePath} />
      </div>
      {/* Content area: only this changes */}
      <div className="flex-1 min-w-0 max-w-[900px]">
        <Outlet />
      </div>
    </div>
  );
}
