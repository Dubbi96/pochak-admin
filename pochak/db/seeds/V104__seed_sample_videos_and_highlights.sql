-- ============================================================================
-- V104: Sample Video Seed Data & AI Highlight Results
-- scripts/ai-highlight/samples/ 의 4종목 영상을 VOD 자산으로 등록하고
-- scripts/ai-highlight/output/*.json 의 하이라이트 결과를 content.highlights에 삽입
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 농구/배구 팀 추가 (기존 시드에 없는 종목)
-- ----------------------------------------------------------------------------
INSERT INTO content.teams (id, sport_id, name, short_name, team_type, status, description) VALUES
    (101, (SELECT id FROM content.sports WHERE code='BASKETBALL'), '서울시청 농구단',   '서농',  'ELITE', 'ACTIVE', '샘플 데이터용 농구팀 A'),
    (102, (SELECT id FROM content.sports WHERE code='BASKETBALL'), '부산 KT소닉붐Jr',   '부농',  'CLUB',  'ACTIVE', '샘플 데이터용 농구팀 B'),
    (103, (SELECT id FROM content.sports WHERE code='VOLLEYBALL'), '인천 흥국생명',     '인배',  'ELITE', 'ACTIVE', '샘플 데이터용 배구팀 A'),
    (104, (SELECT id FROM content.sports WHERE code='VOLLEYBALL'), '수원 현대건설',     '수배',  'ELITE', 'ACTIVE', '샘플 데이터용 배구팀 B')
ON CONFLICT DO NOTHING;

SELECT setval('content.teams_id_seq', 110, true);

-- ----------------------------------------------------------------------------
-- 2. 샘플 경기 (Matches) — 4종목 각 1경기
-- ----------------------------------------------------------------------------
INSERT INTO content.matches (id, sport_id, name, title, status, start_time, end_time, is_displayed) VALUES
    (101, (SELECT id FROM content.sports WHERE code='SOCCER'),
        '샘플 축구 경기 - POC 테스트', '샘플 축구 경기 - POC 테스트', 'COMPLETED',
        '2025-09-01 14:00:00+09', '2025-09-01 16:00:00+09', TRUE),
    (102, (SELECT id FROM content.sports WHERE code='BASEBALL'),
        '샘플 야구 경기 - POC 테스트', '샘플 야구 경기 - POC 테스트', 'COMPLETED',
        '2025-09-02 14:00:00+09', '2025-09-02 17:00:00+09', TRUE),
    (103, (SELECT id FROM content.sports WHERE code='BASKETBALL'),
        '샘플 농구 경기 - POC 테스트', '샘플 농구 경기 - POC 테스트', 'COMPLETED',
        '2025-09-03 15:00:00+09', '2025-09-03 17:00:00+09', TRUE),
    (104, (SELECT id FROM content.sports WHERE code='VOLLEYBALL'),
        '샘플 배구 경기 - POC 테스트', '샘플 배구 경기 - POC 테스트', 'COMPLETED',
        '2025-09-04 16:00:00+09', '2025-09-04 18:00:00+09', TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('content.matches_id_seq', 110, true);

-- ----------------------------------------------------------------------------
-- 3. VOD 자산 등록 (scripts/ai-highlight/samples/ 영상 파일 기반)
--    영상은 /static/samples/ 경로로 서빙 (S3 mock 또는 로컬 static 서버)
-- ----------------------------------------------------------------------------
INSERT INTO content.vod_assets (id, match_id, title, vod_url, thumbnail_url, duration, encoding_status, view_count, is_main, is_displayed) VALUES
    (101, 101,
        '[샘플] 축구 하이라이트 영상',
        '/static/samples/soccer.mp4',
        'https://picsum.photos/seed/sample-soccer/640/360',
        300, 'COMPLETED', 0, TRUE, TRUE),
    (102, 102,
        '[샘플] 야구 하이라이트 영상',
        '/static/samples/baseball.mp4',
        'https://picsum.photos/seed/sample-baseball/640/360',
        300, 'COMPLETED', 0, TRUE, TRUE),
    (103, 103,
        '[샘플] 농구 하이라이트 영상',
        '/static/samples/basketball.mp4',
        'https://picsum.photos/seed/sample-basketball/640/360',
        300, 'COMPLETED', 0, TRUE, TRUE),
    (104, 104,
        '[샘플] 배구 하이라이트 영상',
        '/static/samples/volleyball.mp4',
        'https://picsum.photos/seed/sample-volleyball/640/360',
        300, 'COMPLETED', 0, TRUE, TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('content.vod_assets_id_seq', 110, true);

-- ----------------------------------------------------------------------------
-- 4. AI 하이라이트 결과 삽입
--    content_type='VOD', content_id=vod_assets.id, is_auto_generated=TRUE
--    출처: scripts/ai-highlight/output/*.json
-- ----------------------------------------------------------------------------

-- soccer_highlights.json (3 highlights: PENALTY → GOAL)
INSERT INTO content.highlights (content_id, content_type, sport, start_time_seconds, end_time_seconds, highlight_type, confidence_score, description, is_auto_generated, created_at) VALUES
    (101, 'VOD', 'SOCCER',  35,  40, 'GOAL', 0.88, '페널티킥', TRUE, NOW()),
    (101, 'VOD', 'SOCCER',  95, 100, 'GOAL', 0.89, '페널티킥', TRUE, NOW()),
    (101, 'VOD', 'SOCCER', 155, 160, 'GOAL', 0.89, '페널티킥', TRUE, NOW());

-- baseball_highlights.json (3 highlights: HOME_RUN → CUSTOM)
INSERT INTO content.highlights (content_id, content_type, sport, start_time_seconds, end_time_seconds, highlight_type, confidence_score, description, is_auto_generated, created_at) VALUES
    (102, 'VOD', 'BASEBALL',  25,  30, 'CUSTOM', 0.94, '홈런!', TRUE, NOW()),
    (102, 'VOD', 'BASEBALL',  80,  85, 'CUSTOM', 0.85, '홈런!', TRUE, NOW()),
    (102, 'VOD', 'BASEBALL', 140, 145, 'CUSTOM', 0.99, '홈런!', TRUE, NOW());

-- basketball_highlights.json (BUZZER_BEATER → CUSTOM, DUNK → DUNK)
INSERT INTO content.highlights (content_id, content_type, sport, start_time_seconds, end_time_seconds, highlight_type, confidence_score, description, is_auto_generated, created_at) VALUES
    (103, 'VOD', 'BASKETBALL',  20,  25, 'CUSTOM', 0.87, '버저비터!', TRUE, NOW()),
    (103, 'VOD', 'BASKETBALL',  60,  65, 'DUNK',   0.90, '덩크!',     TRUE, NOW()),
    (103, 'VOD', 'BASKETBALL', 110, 115, 'DUNK',   0.93, '덩크!',     TRUE, NOW()),
    (103, 'VOD', 'BASKETBALL', 160, 165, 'DUNK',   0.88, '덩크!',     TRUE, NOW());

-- volleyball_highlights.json (SPIKE_ACE → ACE, SERVICE_ACE → ACE)
INSERT INTO content.highlights (content_id, content_type, sport, start_time_seconds, end_time_seconds, highlight_type, confidence_score, description, is_auto_generated, created_at) VALUES
    (104, 'VOD', 'VOLLEYBALL',  15,  20, 'ACE', 0.93, '스파이크 에이스!', TRUE, NOW()),
    (104, 'VOD', 'VOLLEYBALL',  45,  50, 'ACE', 0.94, '스파이크 에이스!', TRUE, NOW()),
    (104, 'VOD', 'VOLLEYBALL',  75,  80, 'ACE', 0.97, '서비스 에이스!',   TRUE, NOW()),
    (104, 'VOD', 'VOLLEYBALL', 120, 125, 'ACE', 0.94, '스파이크 에이스!', TRUE, NOW()),
    (104, 'VOD', 'VOLLEYBALL', 165, 170, 'ACE', 0.99, '스파이크 에이스!', TRUE, NOW());
