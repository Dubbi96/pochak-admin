-- POC-226: 종합 테스트 seed 데이터 보강
-- Today: 2026-04-10 (relative to seeding time, using NOW())

-- ============================================================
-- 1. admin.banners (활성 배너 3개 추가)
-- ============================================================
INSERT INTO admin.banners (title, banner_type, image_url_pc, image_url_mobile, link_url, start_date, end_date, display_order, is_active, banner_position)
VALUES
    ('2026 시즌 개막! 포착과 함께하세요', 'EVENT',
     'https://placehold.co/1920x400/1a73e8/white?text=2026+Season+Opening',
     'https://placehold.co/800x400/1a73e8/white?text=2026+Season+Opening',
     '/events/1', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 1, true, 'MAIN'),
    ('스포츠 클럽 가입 이벤트', 'PROMOTION',
     'https://placehold.co/1920x400/e84c1a/white?text=Club+Join+Event',
     'https://placehold.co/800x400/e84c1a/white?text=Club+Join+Event',
     '/events/2', NOW(), NOW() + INTERVAL '14 days', 2, true, 'MAIN'),
    ('VOD 무제한 시즌패스 할인', 'PRODUCT',
     'https://placehold.co/1920x400/1ae84c/333?text=Season+Pass+Sale',
     'https://placehold.co/800x400/1ae84c/333?text=Season+Pass+Sale',
     '/products', NOW(), NOW() + INTERVAL '7 days', 3, true, 'MAIN');

-- ============================================================
-- 2. admin.notices (공지사항 3개)
-- ============================================================
INSERT INTO admin.notices (notice_type, title, content, start_date, end_date, is_active, is_pinned, created_by)
VALUES
    ('SERVICE', '포착 서비스 오픈 안내',
     '<p>2026년 4월 포착 스포츠 플랫폼이 정식 오픈했습니다. 다양한 스포츠 경기를 실시간으로 만나보세요!</p>',
     NOW() - INTERVAL '10 days', NOW() + INTERVAL '60 days', true, true, 1),
    ('MAINTENANCE', '서버 점검 안내 (4월 15일 02:00~04:00)',
     '<p>2026년 4월 15일 새벽 2시부터 4시까지 서버 점검이 예정되어 있습니다. 이용에 불편을 드려서 죄송합니다.</p>',
     NOW(), NOW() + INTERVAL '6 days', true, false, 1),
    ('EVENT', '신규 가입 포인트 2배 이벤트',
     '<p>4월 한 달간 신규 가입 시 웰컴 포인트 2배 지급! 지금 바로 가입하세요.</p>',
     NOW(), NOW() + INTERVAL '20 days', true, false, 1);

-- ============================================================
-- 3. admin.events (이벤트 2개)
-- ============================================================
INSERT INTO admin.events (title, content, start_date, end_date, status, is_active, created_by, image_url)
VALUES
    ('신규 가입 웰컴 포인트 이벤트',
     '<p>포착에 처음 오신 분들을 위한 특별 이벤트입니다. 가입 후 첫 로그인 시 포인트 5,000점을 드립니다.</p>',
     NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'ACTIVE', true, 1,
     'https://placehold.co/800x400/6c63ff/white?text=Welcome+Event'),
    ('친구 초대 이벤트',
     '<p>친구를 초대하면 두 분 모두 포인트 3,000점을 드립니다. 지금 바로 초대 코드를 공유하세요!</p>',
     NOW(), NOW() + INTERVAL '30 days', 'ACTIVE', true, 1,
     'https://placehold.co/800x400/ff6363/white?text=Referral+Event');

-- ============================================================
-- 4. commerce.products (시즌패스, 단건, 포인트 충전)
-- ============================================================
INSERT INTO commerce.products (name, product_type, price_krw, price_point, duration_days, is_active)
VALUES
    ('월정액 시즌패스', 'SUBSCRIPTION', 9900.00, NULL, 30, true),
    ('3개월 시즌패스', 'SUBSCRIPTION', 24900.00, NULL, 90, true),
    ('단건 이용권 (7일)', 'ONE_TIME', 3300.00, NULL, 7, true),
    ('포인트 충전 10,000P', 'POINT', 10000.00, 10000, NULL, true),
    ('포인트 충전 50,000P', 'POINT', 48000.00, 50000, NULL, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. commerce.coupons (테스트 쿠폰 2개)
-- ============================================================
INSERT INTO commerce.coupons (code, title, discount_type, discount_value, min_purchase_amount, max_discount_amount, max_usage_count, per_user_limit, current_usage_count, is_active, start_date, end_date)
VALUES
    ('POCHAK2026', '포착 오픈 기념 20% 할인', 'PERCENTAGE', 20, 5000, 5000, 1000, 1, 0, true,
     NOW(), NOW() + INTERVAL '30 days'),
    ('WELCOME3000', '신규가입 3,000원 할인', 'FIXED_AMOUNT', 3000, 3000, 3000, 500, 1, 0, true,
     NOW(), NOW() + INTERVAL '30 days');

-- ============================================================
-- 6. content.matches (라이브 2개 + 예정 3개, 오늘 기준)
-- ============================================================
INSERT INTO content.matches (competition_id, sport_id, name, title, status, start_time, end_time, is_panorama, is_scoreboard, is_displayed, is_active, venue)
VALUES
    -- 라이브 경기 2개 (현재 진행 중)
    (1, 1, '화랑대기 4강 1경기', '서울FC유소년 vs 부산서면FC',
     'LIVE', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '60 minutes',
     true, true, true, true, '화랑대 운동장'),
    (2, 4, '리틀야구 준결승', '인천리틀스타 vs 수원이글스Jr',
     'LIVE', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '30 minutes',
     false, true, true, true, '인천구장'),
    -- 예정 경기 3개
    (1, 1, '화랑대기 4강 2경기', '강남바스켓 vs 서울FC',
     'SCHEDULED', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '5 hours',
     false, true, true, true, '화랑대 운동장'),
    (5, 1, '전국체전 예선 1라운드', '포착FC A vs 포착FC B',
     'SCHEDULED', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours',
     false, false, true, true, '서울 올림픽 경기장'),
    (2, 4, '리틀야구 결승', '우승팀 TBD vs 2위팀 TBD',
     'SCHEDULED', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours',
     false, false, true, true, '인천구장');

-- ============================================================
-- 7. content.live_assets (라이브 2개 - 위 라이브 경기에 연결)
-- ============================================================
INSERT INTO content.live_assets (match_id, status, stream_url, panorama_url, hd_url, thumbnail_url, start_time, visibility, is_displayed, owner_type, owner_id)
SELECT
    m.id,
    'LIVE',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    NULL,
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://placehold.co/400x225/333/white?text=LIVE',
    m.start_time,
    'PUBLIC',
    true,
    'MATCH',
    m.id
FROM content.matches m
WHERE m.status = 'LIVE'
  AND m.is_active = true
  AND m.title IN ('서울FC유소년 vs 부산서면FC', '인천리틀스타 vs 수원이글스Jr');

-- ============================================================
-- 8. content.vod_assets (VOD 5개)
-- ============================================================
INSERT INTO content.vod_assets (match_id, title, vod_url, thumbnail_url, duration, encoding_status, visibility, is_main, is_displayed, owner_type, owner_id)
SELECT
    m.id,
    m.title || ' 경기 풀영상',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://placehold.co/400x225/1a73e8/white?text=VOD',
    5400,
    'COMPLETED',
    'PUBLIC',
    true,
    true,
    'MATCH',
    m.id
FROM content.matches m
WHERE m.status IN ('COMPLETED', 'LIVE')
  AND m.is_active = true
LIMIT 5;

-- ============================================================
-- 9. content.clip_assets (클립 5개 - VOD에서 파생)
-- ============================================================
-- Reset sequence to avoid primary key conflicts
SELECT setval('content.clip_assets_id_seq', (SELECT COALESCE(MAX(id), 0) FROM content.clip_assets));

INSERT INTO content.clip_assets (source_type, source_id, match_id, creator_user_id, title, clip_url, thumbnail_url, start_time_sec, end_time_sec, duration, encoding_status, visibility, is_displayed)
SELECT
    'VOD',
    v.id,
    v.match_id,
    22,  -- qatest 유저
    v.title || ' 하이라이트 클립',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://placehold.co/400x225/e84c1a/white?text=CLIP',
    0,
    120,
    120,
    'COMPLETED',
    'PUBLIC',
    true
FROM content.vod_assets v
WHERE v.is_displayed = true
LIMIT 5;

-- ============================================================
-- 10. operation.recording_schedules (촬영 일정 3개)
-- ============================================================
INSERT INTO operation.recording_schedules (title, status, start_time, end_time, venue_id, user_id, is_active, memo)
VALUES
    ('화랑대기 4강 현장 촬영', 'IN_PROGRESS',
     NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '90 minutes',
     1, 22, true, '파노라마 카메라 2대 배치 예정'),
    ('리틀야구 준결승 촬영', 'IN_PROGRESS',
     NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour',
     2, 22, true, '일반 카메라 1대'),
    ('전국체전 예선 사전 세팅', 'SCHEDULED',
     NOW() + INTERVAL '23 hours', NOW() + INTERVAL '2 days 2 hours',
     3, 22, true, '4K 카메라 세팅 및 스트림 테스트 포함');
