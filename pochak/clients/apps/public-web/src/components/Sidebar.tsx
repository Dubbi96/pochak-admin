import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import {
  Home,
  Calendar,
  Clapperboard,
  User,
  ChevronRight,
  Plus,
  ExternalLink,
} from "lucide-react";
import { popularChannels } from "@/services/webApi";
import { pochakChannels } from '../../../../shared/mockData';

const navItems = [
  { label: "홈", icon: Home, path: "/home" },
  { label: "일정", icon: Calendar, path: "/schedule" },
  { label: "클립", icon: Clapperboard, path: "/contents" },
  { label: "마이", icon: User, path: "/my" },
];

const adItems = [
  { id: 'ad1', name: '광고카피', logo: '🏃', color: '#FF6D00' },
  { id: 'ad2', name: '광고카피', logo: '🥤', color: '#00838F' },
];

// All joined teams (can be more than 4)
const joinedTeams = pochakChannels.slice(0, 6);

const bottomLinks = [
  { label: "알림내역", path: "/notifications" },
  { label: "설정", path: "/settings" },
  { label: "공지사항", path: "/notices" },
  { label: "고객센터", path: "/support" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const joinedTeamsRef = useRef<HTMLDivElement>(null);


  return (
    <aside className="hidden lg:flex flex-col w-[240px] min-w-[240px] bg-[#1A1A1A] border-r border-[#4D4D4D] fixed top-[70px] left-0 bottom-0 overflow-y-auto scrollbar-hide z-40">
      {/* ── Nav menu (홈/일정/클립/마이) ── */}
      <nav className="px-3 pt-4 pb-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/home" && location.pathname === "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[15px] transition-colors mb-0.5 ${
                isActive
                  ? "text-[#00CC33] font-semibold"
                  : "text-[#A6A6A6] hover:text-white hover:bg-[#262626]"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 border-t border-[#4D4D4D] my-1" />

      {/* ── AD 광고 (나이키 에어맥스, 게토레이) ── */}
      <div className="px-3 py-1 flex flex-col gap-2">
        {adItems.map((ad) => (
          <div
            key={ad.id}
            className="w-full h-[50px] rounded-lg bg-[#262626] flex items-center gap-3 px-3 cursor-pointer hover:bg-[#333333] transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: ad.color }}>
              <span className="text-sm">{ad.logo}</span>
            </div>
            <p className="text-[13px] text-[#A6A6A6] truncate flex-1">{ad.name}</p>
            <span className="text-[11px] font-semibold text-[#A6A6A6] bg-[#404040] px-1.5 py-0.5 rounded flex-shrink-0">
              AD
            </span>
          </div>
        ))}
      </div>

      <div className="mx-4 border-t border-[#4D4D4D] my-1" />

      {/* ── 가입한 클럽 > ── */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="text-[13px] font-semibold text-[#A6A6A6]">가입한 클럽</h3>
          <Link
            to="/my/clubs"
            className="text-[#A6A6A6] hover:text-white transition-colors"
            title="가입한 클럽 전체 보기"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div
          ref={joinedTeamsRef}
          className="flex items-start gap-3 px-3 overflow-x-auto scrollbar-hide"
        >
          {joinedTeams.map((team) => (
            <Link
              key={team.id}
              to={`/team/${team.id}`}
              className="flex-shrink-0 flex flex-col items-center w-[50px] group"
              title={team.name}
            >
              <div
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 border-[#4D4D4D] group-hover:border-[#00CC33] transition-colors"
                style={{ backgroundColor: team.color }}
              >
                {team.initial}
              </div>
              <p className="text-[11px] text-[#A6A6A6] mt-1 text-center truncate w-full">{team.name.slice(0, 4)}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-4 border-t border-[#4D4D4D] my-1" />

      {/* ── 인기 팀/클럽 > ── */}
      <div className="px-3 py-2 flex-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="text-[13px] font-semibold text-[#A6A6A6]">인기 팀/클럽</h3>
          <button
            onClick={() => {
              navigate('/home');
              setTimeout(() => {
                const el = document.getElementById('best-club-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-[#A6A6A6] hover:text-white transition-colors"
            title="Best 클럽 보기"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {popularChannels.map((ch) => (
          <Link
            key={ch.id}
            to={`/team/${ch.id}`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#262626] cursor-pointer transition-colors"
          >
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: ch.color }}
            >
              {ch.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-white font-medium truncate">{ch.name}</p>
              <p className="text-[11px] text-[#A6A6A6] truncate">{ch.subtitle}</p>
            </div>
          </Link>
        ))}
        <Link
          to="/teams"
          className="block px-3 py-2 text-[13px] text-[#A6A6A6] hover:text-white transition-colors"
        >
          더보기
        </Link>
      </div>

      <div className="mx-4 border-t border-[#4D4D4D] my-1" />

      {/* ── Bottom links (알림내역, 설정, 공지사항, 고객센터) ── */}
      <div className="px-3 py-3">
        {bottomLinks.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            className="flex items-center justify-between px-4 py-2 text-[13px] text-[#A6A6A6] hover:text-white hover:bg-[#262626] rounded-lg transition-colors"
          >
            <span>{link.label}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </aside>
  );
}
