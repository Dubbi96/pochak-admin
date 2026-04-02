-- Policy v2: Organization 단체 확장 필드
ALTER TABLE content.organizations
  ADD COLUMN IF NOT EXISTS display_area VARCHAR(10) DEFAULT 'CLUB',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS si_gun_gu_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS is_cug BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS join_policy VARCHAR(20) DEFAULT 'APPROVAL',
  ADD COLUMN IF NOT EXISTS reservation_policy VARCHAR(20) DEFAULT 'MANAGER_ONLY';

-- 기존 데이터 마이그레이션: accessType -> join_policy + display_area 매핑
UPDATE content.organizations SET join_policy = 'OPEN', display_area = 'CITY' WHERE access_type = 'OPEN';
UPDATE content.organizations SET join_policy = 'APPROVAL', display_area = 'CLUB' WHERE access_type = 'CLOSED';

-- 기존 autoApprove -> join_policy 정합
UPDATE content.organizations SET join_policy = 'OPEN' WHERE auto_approve = true AND join_policy = 'APPROVAL';

-- 기존 managerOnlyBooking -> reservation_policy 정합
UPDATE content.organizations SET reservation_policy = 'ALL_MEMBERS' WHERE manager_only_booking = false;

COMMENT ON COLUMN content.organizations.display_area IS '포착 시티(CITY) / 포착 클럽(CLUB) 영역 구분';
COMMENT ON COLUMN content.organizations.is_verified IS '시티 인증 여부 (BO 관리자 인증)';
COMMENT ON COLUMN content.organizations.is_cug IS 'CUG 모드 - 콘텐츠 회원전용 접근제어';
COMMENT ON COLUMN content.organizations.join_policy IS '가입 정책: OPEN/APPROVAL/INVITE_ONLY';
COMMENT ON COLUMN content.organizations.reservation_policy IS '예약 정책: ALL_MEMBERS/MANAGER_ONLY';
