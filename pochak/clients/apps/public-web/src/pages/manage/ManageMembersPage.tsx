import { useState } from 'react';

type Member = {
  id: number;
  nickname: string;
  email: string;
  joinedAt: string;
  status: '활성' | '차단' | '탈퇴';
  role: 'USER' | 'MANAGER' | 'ADMIN';
};

const mockMembers: Member[] = [
  { id: 1, nickname: 'pochak_user01', email: 'user01@pochak.com', joinedAt: '2026-01-15', status: '활성', role: 'USER' },
  { id: 2, nickname: 'sports_fan', email: 'fan@gmail.com', joinedAt: '2026-01-20', status: '활성', role: 'USER' },
  { id: 3, nickname: 'manager_kim', email: 'kim@pochak.com', joinedAt: '2025-12-01', status: '활성', role: 'MANAGER' },
  { id: 4, nickname: 'admin_park', email: 'park@pochak.com', joinedAt: '2025-11-01', status: '활성', role: 'ADMIN' },
  { id: 5, nickname: 'blocked_user', email: 'blocked@test.com', joinedAt: '2026-02-10', status: '차단', role: 'USER' },
  { id: 6, nickname: 'viewer_lee', email: 'lee@gmail.com', joinedAt: '2026-02-15', status: '활성', role: 'USER' },
  { id: 7, nickname: 'clip_master', email: 'clip@pochak.com', joinedAt: '2026-02-18', status: '활성', role: 'USER' },
  { id: 8, nickname: 'withdrawn_user', email: 'withdrawn@test.com', joinedAt: '2025-10-05', status: '탈퇴', role: 'USER' },
  { id: 9, nickname: 'live_fan99', email: 'live99@gmail.com', joinedAt: '2026-03-01', status: '활성', role: 'USER' },
  { id: 10, nickname: 'vod_watcher', email: 'vod@pochak.com', joinedAt: '2026-03-05', status: '활성', role: 'USER' },
  { id: 11, nickname: 'new_member', email: 'new@gmail.com', joinedAt: '2026-03-10', status: '활성', role: 'USER' },
  { id: 12, nickname: 'club_leader', email: 'leader@pochak.com', joinedAt: '2026-01-25', status: '활성', role: 'MANAGER' },
  { id: 13, nickname: 'test_user123', email: 'test123@test.com', joinedAt: '2026-03-15', status: '활성', role: 'USER' },
  { id: 14, nickname: 'spam_report', email: 'spam@test.com', joinedAt: '2026-03-18', status: '차단', role: 'USER' },
  { id: 15, nickname: 'recent_joiner', email: 'recent@gmail.com', joinedAt: '2026-03-22', status: '활성', role: 'USER' },
];

const statusOptions = ['전체', '활성', '차단', '탈퇴'] as const;
const roleOptions = ['전체', 'USER', 'MANAGER', 'ADMIN'] as const;
const roleChangeOptions = ['USER', 'MANAGER', 'ADMIN'] as const;

export default function ManageMembersPage() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [roleFilter, setRoleFilter] = useState<string>('전체');

  const filtered = members.filter((m) => {
    const matchSearch = !search || m.nickname.includes(search) || m.email.includes(search);
    const matchStatus = statusFilter === '전체' || m.status === statusFilter;
    const matchRole = roleFilter === '전체' || m.role === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const handleRoleChange = (id: number, newRole: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    if (confirm(`${member.nickname}의 권한을 ${newRole}(으)로 변경하시겠습니까?`)) {
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role: newRole as Member['role'] } : m));
      alert(`${member.nickname}의 권한이 ${newRole}(으)로 변경되었습니다.`);
    }
  };

  const handleBlockToggle = (id: number) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    const action = member.status === '차단' ? '해제' : '차단';
    if (confirm(`${member.nickname}을(를) ${action}하시겠습니까?`)) {
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: member.status === '차단' ? '활성' as const : '차단' as const } : m));
      alert(`${member.nickname}이(가) ${action}되었습니다.`);
    }
  };

  const handleWithdraw = (id: number) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    if (confirm('정말 탈퇴 처리하시겠습니까?')) {
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: '탈퇴' as const } : m));
      alert(`${member.nickname}이(가) 탈퇴 처리되었습니다.`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">회원 관리</h1>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 이메일, 전화번호 검색"
          className="flex-1 min-w-[200px] bg-[#333333] border border-[#4D4D4D] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] focus:outline-none focus:border-[#00CC33]"
        />

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#333333] border border-[#4D4D4D] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00CC33]"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>상태: {s}</option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#333333] border border-[#4D4D4D] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00CC33]"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>권한: {r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#262626] border border-[#4D4D4D] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#4D4D4D] text-[#A6A6A6]">
                <th className="text-left px-4 py-3 font-medium">닉네임</th>
                <th className="text-left px-4 py-3 font-medium">이메일</th>
                <th className="text-left px-4 py-3 font-medium">가입일</th>
                <th className="text-left px-4 py-3 font-medium">상태</th>
                <th className="text-left px-4 py-3 font-medium">권한</th>
                <th className="text-right px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-[#3A3A3A] last:border-b-0 hover:bg-[#2A2A2A]">
                  <td className="px-4 py-3 text-white font-medium">{member.nickname}</td>
                  <td className="px-4 py-3 text-[#A6A6A6]">{member.email}</td>
                  <td className="px-4 py-3 text-[#A6A6A6]">{member.joinedAt}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      member.status === '활성' ? 'text-[#00CC33]' :
                      member.status === '차단' ? 'text-red-400' :
                      'text-[#808080]'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={member.status === '탈퇴'}
                      className="bg-[#333333] border border-[#4D4D4D] rounded px-2 py-1 text-xs text-white focus:outline-none disabled:opacity-50"
                    >
                      {roleChangeOptions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {member.status !== '탈퇴' && (
                        <>
                          <button
                            onClick={() => handleBlockToggle(member.id)}
                            className={`px-2.5 py-1 text-xs rounded transition-colors ${
                              member.status === '차단'
                                ? 'bg-[#00CC33]/20 text-[#00CC33] hover:bg-[#00CC33]/30'
                                : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                            }`}
                          >
                            {member.status === '차단' ? '해제' : '차단'}
                          </button>
                          <button
                            onClick={() => handleWithdraw(member.id)}
                            className="px-2.5 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            탈퇴
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
