import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Eye, EyeOff, X } from 'lucide-react';
import { putApi } from '@/services/apiClient';
import { useToast } from '@/hooks/useToast';

/* ── Reusable section wrapper ────────────────────────────────────────────── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-[18px] font-semibold text-white mb-3">{title}</h2>
      <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] p-5 space-y-5">
        {children}
      </div>
    </div>
  );
}

/* ── Field row ───────────────────────────────────────────────────────────── */
function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-[100px] flex-shrink-0 text-[14px] text-[#A6A6A6] pt-2">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/* ── Chip tag ────────────────────────────────────────────────────────────── */
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
        selected
          ? 'bg-[#00CC33] text-[#1A1A1A]'
          : 'bg-[#1A1A1A] border border-[#4D4D4D] text-[#A6A6A6] hover:text-white hover:border-[#A6A6A6]'
      }`}
    >
      {label}
    </button>
  );
}

/* ── Password field with visibility toggle ───────────────────────────────── */
function PasswordInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg px-3 py-2 text-[14px] text-white placeholder-[#666] focus:outline-none focus:border-[#00CC33] transition-colors"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6A6A6] hover:text-white"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   AccountInfoPage — 계정정보 (PDF p10-12)
   ══════════════════════════════════════════════════════════════════════════════ */

const SPORTS_TAGS = ['축구', '야구', '배구', '농구', '테니스', '탁구', '수영', '골프', '볼링', '배드민턴'];
const REGION_TAGS = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주'];

export default function AccountInfoPage() {
  const navigate = useNavigate();
  const toast = useToast();

  /* ── Profile state ──────────────────────────────────────────────────── */
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [nickname, setNickname] = useState(() => {
    try {
      const raw = localStorage.getItem('pochak_user');
      if (raw) {
        const user = JSON.parse(raw);
        return user.nickname || user.name || '포착유저';
      }
    } catch { /* ignore */ }
    return '포착유저';
  });
  const [bio, setBio] = useState('');
  const BIO_MAX = 100;
  const [savingNickname, setSavingNickname] = useState(false);

  /* ── Account state ──────────────────────────────────────────────────── */
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /* ── Personal info state ────────────────────────────────────────────── */
  const [name] = useState('홍길동');
  const [birth] = useState('1990.01.01');
  const [gender] = useState('남');
  const [phone] = useState('010-****-1234');
  const [email, setEmail] = useState('user@email.com');
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  /* ── Additional info ────────────────────────────────────────────────── */
  const [selectedSports, setSelectedSports] = useState<string[]>(['축구', '야구']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['서울', '경기']);
  const [belongTeam, setBelongTeam] = useState('');

  /* ── Withdrawal dialog ──────────────────────────────────────────────── */
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  /* ── Handlers ───────────────────────────────────────────────────────── */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (
    tag: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSelected(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );
  };

  const handleNicknameSave = async () => {
    if (!nickname.trim()) {
      toast.show('닉네임을 입력해주세요.');
      return;
    }
    setSavingNickname(true);
    try {
      await putApi('/users/me', { nickname: nickname.trim() }, { nickname: nickname.trim() });
      // Update localStorage
      try {
        const raw = localStorage.getItem('pochak_user');
        const user = raw ? JSON.parse(raw) : {};
        user.nickname = nickname.trim();
        localStorage.setItem('pochak_user', JSON.stringify(user));
      } catch {
        localStorage.setItem('pochak_user', JSON.stringify({ nickname: nickname.trim() }));
      }
      window.dispatchEvent(new Event('pochak_auth_change'));
      toast.show('닉네임이 변경되었습니다.');
    } catch {
      toast.show('닉네임 변경에 실패했습니다.');
    } finally {
      setSavingNickname(false);
    }
  };

  return (
    <div>
        <h1 className="text-[28px] font-bold text-white mb-8">계정정보</h1>

        {/* ─── 1. 프로필 관리 ─────────────────────────────────────────── */}
        <Section title="프로필 관리">
          {/* Avatar */}
          <FieldRow label="프로필 이미지">
            <div className="flex items-center gap-4">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-[#1A1A1A] border border-[#4D4D4D] group"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[28px] font-bold text-[#00CC33]">
                    포
                  </div>
                )}
                {/* Camera overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <span className="text-[12px] text-[#A6A6A6]">
                클릭하여 프로필 이미지를 변경하세요
              </span>
            </div>
          </FieldRow>

          {/* Nickname */}
          <FieldRow label="닉네임">
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className="flex-1 bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg px-3 py-2 text-[14px] text-white placeholder-[#666] focus:outline-none focus:border-[#00CC33] transition-colors"
              />
              <button
                onClick={handleNicknameSave}
                disabled={savingNickname}
                className="px-4 py-2 bg-[#00CC33] text-[#1A1A1A] text-[13px] font-semibold rounded-lg hover:bg-[#00B82E] transition-colors flex-shrink-0 disabled:opacity-50"
              >
                {savingNickname ? '저장 중...' : '변경'}
              </button>
            </div>
          </FieldRow>

          {/* Bio */}
          <FieldRow label="소개글">
            <div>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= BIO_MAX) setBio(e.target.value);
                }}
                placeholder="자신을 소개해보세요"
                rows={3}
                className="w-full bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg px-3 py-2 text-[14px] text-white placeholder-[#666] focus:outline-none focus:border-[#00CC33] transition-colors resize-none"
              />
              <p className="text-right text-[12px] text-[#A6A6A6] mt-1">
                {bio.length}/{BIO_MAX}
              </p>
            </div>
          </FieldRow>
        </Section>

        {/* ─── 2. 계정 정보 ──────────────────────────────────────────── */}
        <Section title="계정 정보">
          {/* Login method */}
          <FieldRow label="로그인 방식">
            <div className="flex items-center gap-2 py-2">
              <div className="w-5 h-5 rounded-full bg-[#FEE500] flex items-center justify-center">
                <span className="text-[11px] font-bold text-[#3C1E1E]">K</span>
              </div>
              <span className="text-[14px] text-white">카카오 로그인</span>
            </div>
          </FieldRow>

          {/* ID */}
          <FieldRow label="아이디">
            <p className="text-[14px] text-white py-2">user@email.com</p>
          </FieldRow>

          {/* Password change */}
          <FieldRow label="비밀번호">
            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="px-4 py-2 border border-[#4D4D4D] text-[#A6A6A6] text-[13px] rounded-lg hover:text-white hover:border-[#A6A6A6] transition-colors"
              >
                변경
              </button>
            ) : (
              <div className="space-y-3">
                <PasswordInput
                  placeholder="현재 비밀번호"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                />
                <PasswordInput
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={setNewPassword}
                />
                <PasswordInput
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-[#00CC33] text-[#1A1A1A] text-[13px] font-semibold rounded-lg hover:bg-[#00B82E] transition-colors"
                    onClick={() => {
                      if (!currentPassword || !newPassword || !confirmPassword) {
                        alert('모든 비밀번호 필드를 입력해주세요.');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        alert('새 비밀번호가 일치하지 않습니다.');
                        return;
                      }
                      alert('비밀번호가 변경되었습니다.');
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    변경 완료
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-4 py-2 border border-[#4D4D4D] text-[#A6A6A6] text-[13px] rounded-lg hover:text-white hover:border-[#A6A6A6] transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </FieldRow>
        </Section>

        {/* ─── 3. 개인정보 ───────────────────────────────────────────── */}
        <Section title="개인정보">
          <FieldRow label="이름">
            <p className="text-[14px] text-white py-2">{name}</p>
          </FieldRow>

          <FieldRow label="생년월일">
            <p className="text-[14px] text-white py-2">{birth}</p>
          </FieldRow>

          <FieldRow label="성별">
            <p className="text-[14px] text-white py-2">{gender}</p>
          </FieldRow>

          <FieldRow label="휴대폰">
            <div className="flex items-center gap-2">
              {editingPhone ? (
                <>
                  <input
                    type="tel"
                    defaultValue=""
                    placeholder="010-0000-0000"
                    className="flex-1 bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg px-3 py-2 text-[14px] text-white placeholder-[#666] focus:outline-none focus:border-[#00CC33] transition-colors"
                  />
                  <button
                    onClick={() => setEditingPhone(false)}
                    className="px-4 py-2 bg-[#00CC33] text-[#1A1A1A] text-[13px] font-semibold rounded-lg hover:bg-[#00B82E] transition-colors flex-shrink-0"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => setEditingPhone(false)}
                    className="px-4 py-2 border border-[#4D4D4D] text-[#A6A6A6] text-[13px] rounded-lg hover:text-white transition-colors flex-shrink-0"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[14px] text-white py-2">{phone}</span>
                  <button
                    onClick={() => setEditingPhone(true)}
                    className="px-4 py-2 border border-[#4D4D4D] text-[#A6A6A6] text-[13px] rounded-lg hover:text-white hover:border-[#A6A6A6] transition-colors flex-shrink-0"
                  >
                    변경
                  </button>
                </>
              )}
            </div>
          </FieldRow>

          <FieldRow label="이메일">
            <div className="flex items-center gap-2">
              {editingEmail ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg px-3 py-2 text-[14px] text-white placeholder-[#666] focus:outline-none focus:border-[#00CC33] transition-colors"
                  />
                  <button
                    onClick={() => setEditingEmail(false)}
                    className="px-4 py-2 bg-[#00CC33] text-[#1A1A1A] text-[13px] font-semibold rounded-lg hover:bg-[#00B82E] transition-colors flex-shrink-0"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => setEditingEmail(false)}
                    className="px-4 py-2 border border-[#4D4D4D] text-[#A6A6A6] text-[13px] rounded-lg hover:text-white transition-colors flex-shrink-0"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[14px] text-white py-2">{email}</span>
                  <button
                    onClick={() => setEditingEmail(true)}
                    className="px-4 py-2 border border-[#4D4D4D] text-[#A6A6A6] text-[13px] rounded-lg hover:text-white hover:border-[#A6A6A6] transition-colors flex-shrink-0"
                  >
                    변경
                  </button>
                </>
              )}
            </div>
          </FieldRow>
        </Section>

        {/* ─── 4. 추가정보 ───────────────────────────────────────────── */}
        <Section title="추가정보">
          <FieldRow label="관심종목">
            <div className="flex flex-wrap gap-2">
              {SPORTS_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={selectedSports.includes(tag)}
                  onClick={() => toggleTag(tag, selectedSports, setSelectedSports)}
                />
              ))}
            </div>
          </FieldRow>

          <FieldRow label="관심지역">
            <div className="flex flex-wrap gap-2">
              {REGION_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={selectedRegions.includes(tag)}
                  onClick={() => toggleTag(tag, selectedRegions, setSelectedRegions)}
                />
              ))}
            </div>
          </FieldRow>

          <FieldRow label="소속팀">
            <input
              type="text"
              value={belongTeam}
              onChange={(e) => setBelongTeam(e.target.value)}
              placeholder="소속팀을 입력하세요"
              className="w-full bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg px-3 py-2 text-[14px] text-white placeholder-[#666] focus:outline-none focus:border-[#00CC33] transition-colors"
            />
          </FieldRow>
        </Section>

        {/* ─── 5. 회원탈퇴 ───────────────────────────────────────────── */}
        <div className="mb-8 pt-4 border-t border-[#333]">
          {!showWithdrawConfirm ? (
            <button
              onClick={() => setShowWithdrawConfirm(true)}
              className="text-[13px] text-[#A6A6A6] hover:text-[#E51728] transition-colors"
            >
              회원탈퇴
            </button>
          ) : (
            <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-white">
                  정말 탈퇴하시겠습니까?
                </h3>
                <button
                  onClick={() => setShowWithdrawConfirm(false)}
                  className="text-[#A6A6A6] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[13px] text-[#A6A6A6] leading-relaxed">
                회원탈퇴 시 모든 개인정보 및 이용내역이 삭제되며, 삭제된 데이터는
                복구할 수 없습니다. 구매한 이용권, 볼, 기프트볼 등은 모두
                소멸됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-[#E51728] text-white text-[13px] font-semibold rounded-lg hover:bg-[#CC1322] transition-colors"
                  onClick={() => {
                    if (window.confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                      localStorage.removeItem('pochak_token');
                      localStorage.removeItem('pochak_user');
                      navigate('/login');
                    }
                  }}
                >
                  탈퇴하기
                </button>
                <button
                  onClick={() => setShowWithdrawConfirm(false)}
                  className="px-4 py-2 border border-[#4D4D4D] text-[#A6A6A6] text-[13px] rounded-lg hover:text-white hover:border-[#A6A6A6] transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
