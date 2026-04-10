-- ============================================================================
-- V102: Seed Banner Images + Commerce Products + Notices
-- Pochak OTT Platform - Additional seed data for Web/BO display
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 핸드볼 종목 추가 (sports에 없으면)
-- ----------------------------------------------------------------------------
INSERT INTO content.sports (name, code, display_order, is_active) VALUES
    ('핸드볼', 'HANDBALL', 6, TRUE)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. 추가 대회 (MLB컵 리틀야구)
-- ----------------------------------------------------------------------------
INSERT INTO content.competitions (id, sport_id, name, short_name, competition_type, status, start_date, end_date, is_free, description) VALUES
    (6, (SELECT id FROM content.sports WHERE code='BASEBALL'),
        '6회 MLB컵 리틀야구 U10', 'MLB컵', 'TOURNAMENT', 'IN_PROGRESS',
        '2026-01-01', '2026-02-01', FALSE,
        '전국리틀야구대회 U10 - 6회 MLB컵'),
    (7, (SELECT id FROM content.sports WHERE code='SOCCER'),
        '106회 전국체육대회 (배구)', '전국체전', 'TOURNAMENT', 'SCHEDULED',
        '2026-05-01', '2026-06-30', FALSE,
        '제106회 전국체육대회'),
    (8, (SELECT id FROM content.sports WHERE code='HANDBALL'),
        '2025 세계육상선수권 혼성', '세계육상', 'TOURNAMENT', 'SCHEDULED',
        '2025-09-01', '2025-09-15', FALSE,
        '2025 세계육상선수권 부산클라인리')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. 추가 팀 (동대문 리틀야구, 군포시 리틀야구)
-- ----------------------------------------------------------------------------
INSERT INTO content.teams (id, sport_id, name, short_name, team_type, status, description) VALUES
    (13, (SELECT id FROM content.sports WHERE code='BASEBALL'), '동대문 리틀야구', '동', 'CLUB', 'ACTIVE', '6회 MLB컵 전국리틀야구대회 U10'),
    (14, (SELECT id FROM content.sports WHERE code='BASEBALL'), '군포시 리틀야구',  '군', 'CLUB', 'ACTIVE', '6회 MLB컵 전국리틀야구대회 U10')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. 추가 경기 (MLB컵 경기들)
-- ----------------------------------------------------------------------------
INSERT INTO content.matches (id, competition_id, sport_id, name, title, status, start_time, end_time, home_score, away_score) VALUES
    (7, 6, (SELECT id FROM content.sports WHERE code='BASEBALL'),
        '동대문구 리틀야구 vs 군포시 리틀야구', '동대문구 리틀야구 vs 군포시 리틀야구', 'COMPLETED',
        '2026-01-01 01:30:00+09', '2026-01-01 03:00:00+09', 5, 2),
    (8, 6, (SELECT id FROM content.sports WHERE code='BASEBALL'),
        '동대문구 리틀야구 vs 군포시 리틀야구', '동대문구 리틀야구 vs 군포시 리틀야구', 'COMPLETED',
        '2026-01-01 04:00:00+09', '2026-01-01 05:30:00+09', 5, 2),
    (9, 6, (SELECT id FROM content.sports WHERE code='BASEBALL'),
        '동대문구 리틀야구 vs 군포시 리틀야구', '동대문구 리틀야구 vs 군포시 리틀야구', 'COMPLETED',
        '2026-01-01 06:00:00+09', '2026-01-01 07:30:00+09', 5, 2)
ON CONFLICT DO NOTHING;

INSERT INTO content.match_participants (match_id, team_id, side, team_name) VALUES
    (7, 13, 'HOME', '동대문구 리틀야구'),
    (7, 14, 'AWAY', '군포시 리틀야구'),
    (8, 13, 'HOME', '동대문구 리틀야구'),
    (8, 14, 'AWAY', '군포시 리틀야구'),
    (9, 13, 'HOME', '동대문구 리틀야구'),
    (9, 14, 'AWAY', '군포시 리틀야구')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. 추가 VOD (MLB컵 경기 다시보기)
-- ----------------------------------------------------------------------------
INSERT INTO content.vod_assets (id, match_id, title, vod_url, thumbnail_url, duration, encoding_status, view_count, is_main) VALUES
    (7, 7, '동대문구 리틀야구 vs 군포시 리틀야구',
        'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        'https://picsum.photos/seed/vod-mlb1/640/360', 5400, 'COMPLETED', 12400, TRUE),
    (8, 8, '동대문구 리틀야구 vs 군포시 리틀야구',
        'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        'https://picsum.photos/seed/vod-mlb2/640/360', 5400, 'COMPLETED', 8900, TRUE),
    (9, 9, '동대문구 리틀야구 vs 군포시 리틀야구',
        'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        'https://picsum.photos/seed/vod-mlb3/640/360', 5400, 'COMPLETED', 6700, TRUE)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. 상품 (Commerce Products) — BO/웹 구독 페이지 공용
-- ----------------------------------------------------------------------------
INSERT INTO commerce.products (id, name, product_type, price_krw, is_active) VALUES
    (1, '''6회 MLB컵 리틀야구 U10'' 시청권', 'SUBSCRIPTION', 10010, TRUE),
    (2, '''6회 MLB컵 리틀야구 U10'' 시청권', 'SUBSCRIPTION', 10010, TRUE),
    (3, '''6회 MLB컵 리틀야구 U10'' 시청권', 'SPORT_PASS', 10010, TRUE),
    (4, '''6회 MLB컵 리틀야구 U10'' 시청권', 'COMPETITION_PASS', 10010, TRUE),
    (5, '''6회 MLB컵 리틀야구 U10'' 시청권', 'SUBSCRIPTION', 10010, TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('commerce.products_id_seq', 10, true);

-- ----------------------------------------------------------------------------
-- 7. 공지사항 (Admin Notices)
-- ----------------------------------------------------------------------------
INSERT INTO admin.notices (id, notice_type, title, content, start_date, end_date, is_active) VALUES
    (1, 'SERVICE', '[공지] 포착 3.0 서비스 오픈 안내', '포착 3.0 서비스가 오픈되었습니다.',
        '2026-03-20 00:00:00+09', '2099-12-31 23:59:59+09', TRUE),
    (2, 'EVENT', '[이벤트] 화랑대기 무료 시청 이벤트', '화랑대기 전 경기 무료 시청 이벤트를 진행합니다.',
        '2026-03-15 00:00:00+09', '2099-12-31 23:59:59+09', TRUE),
    (3, 'MAINTENANCE', '[점검] 3/10 서버 점검 안내', '3월 10일 02:00~06:00 서버 점검이 진행됩니다.',
        '2026-03-08 00:00:00+09', '2099-12-31 23:59:59+09', TRUE),
    (4, 'SERVICE', '[공지] 개인정보처리방침 변경 안내', '개인정보처리방침이 변경되었습니다.',
        '2026-03-01 00:00:00+09', '2099-12-31 23:59:59+09', TRUE),
    (5, 'EVENT', '[이벤트] 신규 가입 시 30일 무료 시청권', '신규 가입 시 30일 무료 시청권을 지급합니다.',
        '2026-02-20 00:00:00+09', '2099-12-31 23:59:59+09', TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('admin.notices_id_seq', 10, true);

-- ----------------------------------------------------------------------------
-- 8. 배너 업데이트 (실제 unsplash 스포츠 이미지)
-- ----------------------------------------------------------------------------
UPDATE content.display_sections SET config = jsonb_set(
    config,
    '{imageUrl}',
    '"https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1280&h=480&fit=crop"'
) WHERE id = 1;

UPDATE content.display_sections SET config = jsonb_set(
    config,
    '{imageUrl}',
    '"https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1280&h=480&fit=crop"'
) WHERE id = 2;

UPDATE content.display_sections SET config = jsonb_set(
    config,
    '{imageUrl}',
    '"https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=1280&h=480&fit=crop"'
) WHERE id = 3;
