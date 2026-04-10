-- ============================================================================
-- V101: Seed Content Data
-- 대회, 팀, 경기, LIVE/VOD/CLIP 자산 — shared/mockData.ts와 동일한 데이터
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 협회 (Associations)
-- ----------------------------------------------------------------------------
INSERT INTO content.associations (id, sport_id, name, short_name, status) VALUES
    (1, (SELECT id FROM content.sports WHERE code='SOCCER'),     '대한축구협회',       'KFA',  'ACTIVE'),
    (2, (SELECT id FROM content.sports WHERE code='BASEBALL'),   '대한야구소프트볼협회', 'KBA',  'ACTIVE'),
    (3, (SELECT id FROM content.sports WHERE code='FUTSAL'),     '나이키코리아',       'NK',   'ACTIVE'),
    (4, (SELECT id FROM content.sports WHERE code='BASKETBALL'), '서울시테니스협회',    'STA',  'ACTIVE')
ON CONFLICT DO NOTHING;

SELECT setval('content.associations_id_seq', 10, true);

-- ----------------------------------------------------------------------------
-- 2. 대회 (Competitions) — matches pochakCompetitions comp-1~5
-- ----------------------------------------------------------------------------
INSERT INTO content.competitions (id, sport_id, name, short_name, competition_type, status, start_date, end_date, is_free, description) VALUES
    (1, (SELECT id FROM content.sports WHERE code='SOCCER'),
        '2025 화랑대기', '화랑대기', 'TOURNAMENT', 'IN_PROGRESS',
        '2025-10-20', '2025-10-30', TRUE,
        '대한축구협회에서 주관하는 유소년 축구대회. 전국의 유소년 팀들이 참가하여 차세대 축구 스타를 발굴하는 대회입니다.'),
    (2, (SELECT id FROM content.sports WHERE code='BASEBALL'),
        '제5회 전국 리틀야구', '리틀야구', 'TOURNAMENT', 'SCHEDULED',
        '2025-11-01', '2025-11-10', FALSE,
        '대한야구소프트볼협회에서 주관하는 전국 리틀야구 대회입니다.'),
    (3, (SELECT id FROM content.sports WHERE code='FUTSAL'),
        '나이키 에어맥스 프리데이', '프리데이', 'TOURNAMENT', 'SCHEDULED',
        '2025-10-25', '2025-10-27', FALSE,
        '나이키코리아에서 주관하는 풋살 대회입니다.'),
    (4, (SELECT id FROM content.sports WHERE code='BASKETBALL'),
        '제30회 서울시 협회장기', '협회장기', 'LEAGUE', 'SCHEDULED',
        '2025-11-05', '2025-11-15', FALSE,
        '서울시테니스협회에서 주관하는 테니스 대회입니다.'),
    (5, (SELECT id FROM content.sports WHERE code='SOCCER'),
        '2025 전국체전', '전국체전', 'TOURNAMENT', 'COMPLETED',
        '2025-10-15', '2025-10-22', FALSE,
        '대한체육회에서 주관하는 종합체육대회입니다.')
ON CONFLICT DO NOTHING;

SELECT setval('content.competitions_id_seq', 10, true);

-- ----------------------------------------------------------------------------
-- 3. 팀 (Teams) — matches pochakChannels ch-1~7
-- ----------------------------------------------------------------------------
INSERT INTO content.teams (id, sport_id, name, short_name, team_type, status, description) VALUES
    (1, (SELECT id FROM content.sports WHERE code='SOCCER'),   '송도고',           '송',   'ELITE', 'ACTIVE', '2025 화랑대기 참가팀'),
    (2, (SELECT id FROM content.sports WHERE code='SOCCER'),   '울산울브스FC',      '울',   'CLUB',  'ACTIVE', '2024 포착 유소년축구 참가팀'),
    (3, (SELECT id FROM content.sports WHERE code='SOCCER'),   '경기용인YSFC',     '경',   'CLUB',  'ACTIVE', '2025 화랑대기 참가팀'),
    (4, (SELECT id FROM content.sports WHERE code='SOCCER'),   '대구강북주니어',    '대',   'CLUB',  'ACTIVE', '2025 화랑대기 참가팀'),
    (5, (SELECT id FROM content.sports WHERE code='SOCCER'),   '인천남동FC',        '인',   'CLUB',  'ACTIVE', '2025 화랑대기 유소년축구 참가팀'),
    (6, (SELECT id FROM content.sports WHERE code='SOCCER'),   '서울강남FC',        '서',   'CLUB',  'ACTIVE', '2025 화랑대기 참가팀'),
    (7, (SELECT id FROM content.sports WHERE code='SOCCER'),   '부산서면유소년',    '부',   'CLUB',  'ACTIVE', '2025 화랑대기 참가팀'),
    (8, (SELECT id FROM content.sports WHERE code='SOCCER'),   '수원삼성블루윙즈',  '수',   'ELITE', 'ACTIVE', '화랑대기 참가팀'),
    (9, (SELECT id FROM content.sports WHERE code='BASEBALL'), '인천리틀스타',      '인',   'CLUB',  'ACTIVE', '리틀야구 참가팀'),
    (10,(SELECT id FROM content.sports WHERE code='BASEBALL'), '수원이글스Jr',      '수',   'CLUB',  'ACTIVE', '리틀야구 참가팀'),
    (11,(SELECT id FROM content.sports WHERE code='FUTSAL'),   '서울시청FC',        '서',   'ELITE', 'ACTIVE', '프리데이 참가팀'),
    (12,(SELECT id FROM content.sports WHERE code='FUTSAL'),   '강남유나이티드',    '강',   'CLUB',  'ACTIVE', '프리데이 참가팀')
ON CONFLICT DO NOTHING;

SELECT setval('content.teams_id_seq', 20, true);

-- ----------------------------------------------------------------------------
-- 4. 경기 (Matches) — matches pochakMatches live-1~6
-- ----------------------------------------------------------------------------
INSERT INTO content.matches (id, competition_id, sport_id, name, title, status, start_time, end_time) VALUES
    (1, 1, (SELECT id FROM content.sports WHERE code='SOCCER'),
        '경기용인YSFC vs 대구강북주니어', '경기용인YSFC vs 대구강북주니어', 'LIVE',
        '2025-10-20 12:00:00+09', '2025-10-20 14:00:00+09'),
    (2, 1, (SELECT id FROM content.sports WHERE code='SOCCER'),
        '인천남동FC vs 수원삼성블루윙즈', '인천남동FC vs 수원삼성블루윙즈', 'LIVE',
        '2025-10-20 12:00:00+09', '2025-10-20 14:00:00+09'),
    (3, 1, (SELECT id FROM content.sports WHERE code='SOCCER'),
        '서울강남FC vs 부산서면유소년', '서울강남FC vs 부산서면유소년', 'LIVE',
        '2025-10-20 14:00:00+09', '2025-10-20 16:00:00+09'),
    (4, 2, (SELECT id FROM content.sports WHERE code='BASEBALL'),
        '인천리틀스타 vs 수원이글스Jr', '인천리틀스타 vs 수원이글스Jr', 'SCHEDULED',
        '2025-11-01 10:00:00+09', '2025-11-01 13:00:00+09'),
    (5, 4, (SELECT id FROM content.sports WHERE code='BASKETBALL'),
        '서울시협회장기 남자단식 결승', '서울시협회장기 남자단식 결승', 'SCHEDULED',
        '2025-11-05 14:00:00+09', '2025-11-05 17:00:00+09'),
    (6, 3, (SELECT id FROM content.sports WHERE code='FUTSAL'),
        '나이키 에어맥스 프리데이 결승', '나이키 에어맥스 프리데이 결승', 'SCHEDULED',
        '2025-10-27 16:00:00+09', '2025-10-27 18:00:00+09')
ON CONFLICT DO NOTHING;

SELECT setval('content.matches_id_seq', 20, true);

-- 경기 참가팀
INSERT INTO content.match_participants (match_id, team_id, side, team_name) VALUES
    (1, 3,  'HOME', '경기용인YSFC'),
    (1, 4,  'AWAY', '대구강북주니어'),
    (2, 5,  'HOME', '인천남동FC'),
    (2, 8,  'AWAY', '수원삼성블루윙즈'),
    (3, 6,  'HOME', '서울강남FC'),
    (3, 7,  'AWAY', '부산서면유소년'),
    (4, 9,  'HOME', '인천리틀스타'),
    (4, 10, 'AWAY', '수원이글스Jr'),
    (6, 11, 'HOME', '서울시청FC'),
    (6, 12, 'AWAY', '강남유나이티드')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. LIVE 자산 — matches pochakLiveContents live-1~6
-- ----------------------------------------------------------------------------
INSERT INTO content.live_assets (id, match_id, status, stream_url, thumbnail_url, start_time, view_count) VALUES
    (1, 1, 'BROADCASTING', 'https://stream.example.com/live/001',
        'https://picsum.photos/seed/live-1/640/360', '2025-10-20 12:00:00+09', 3420),
    (2, 2, 'BROADCASTING', 'https://stream.example.com/live/002',
        'https://picsum.photos/seed/live-2/640/360', '2025-10-20 12:00:00+09', 2100),
    (3, 3, 'BROADCASTING', 'https://stream.example.com/live/003',
        'https://picsum.photos/seed/live-3/640/360', '2025-10-20 14:00:00+09', 1540),
    (4, 4, 'SCHEDULED', NULL,
        'https://picsum.photos/seed/live-4/640/360', '2025-11-01 10:00:00+09', 0),
    (5, 5, 'SCHEDULED', NULL,
        'https://picsum.photos/seed/live-5/640/360', '2025-11-05 14:00:00+09', 0),
    (6, 6, 'SCHEDULED', NULL,
        'https://picsum.photos/seed/live-6/640/360', '2025-10-27 16:00:00+09', 0)
ON CONFLICT DO NOTHING;

SELECT setval('content.live_assets_id_seq', 20, true);

-- ----------------------------------------------------------------------------
-- 6. VOD 자산 — matches pochakVodContents vod-1~6
-- ----------------------------------------------------------------------------
INSERT INTO content.vod_assets (id, match_id, title, vod_url, thumbnail_url, duration, encoding_status, view_count, is_main) VALUES
    (1, 1, '경기용인 vs 대구강북 풀 하이라이트',
        'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        'https://picsum.photos/seed/vod-1/640/360', 332, 'COMPLETED', 45200, TRUE),
    (2, 2, '인천남동 vs 수원삼성 풀매치',
        'https://vod.example.com/vod/002.mp4',
        'https://picsum.photos/seed/vod-2/640/360', 6750, 'COMPLETED', 32100, TRUE),
    (3, 3, '서울강남 vs 부산서면 베스트 플레이',
        'https://vod.example.com/vod/003.mp4',
        'https://picsum.photos/seed/vod-3/640/360', 6310, 'COMPLETED', 28700, TRUE),
    (4, 1, '대구 vs 포항 풀 하이라이트',
        'https://vod.example.com/vod/004.mp4',
        'https://picsum.photos/seed/vod-4/640/360', 298, 'COMPLETED', 21000, FALSE),
    (5, NULL, '감독의 하루 - 화랑대기 편',
        'https://vod.example.com/vod/005.mp4',
        'https://picsum.photos/seed/vod-5/640/360', 1820, 'COMPLETED', 34500, FALSE),
    (6, NULL, '루키 다이어리 시즌2 EP.1',
        'https://vod.example.com/vod/006.mp4',
        'https://picsum.photos/seed/vod-6/640/360', 2400, 'COMPLETED', 28100, FALSE)
ON CONFLICT DO NOTHING;

SELECT setval('content.vod_assets_id_seq', 20, true);

-- ----------------------------------------------------------------------------
-- 7. CLIP 자산 — matches pochakClips clip-1~8
-- ----------------------------------------------------------------------------
INSERT INTO content.clip_assets (id, source_type, source_id, match_id, creator_user_id, title, clip_url, thumbnail_url, start_time_sec, end_time_sec, duration, encoding_status, view_count) VALUES
    (1, 'VOD', 1, 1, 1, 'U12 유망주 김포착 환상 드리블',
        'https://vod.example.com/clip/001.mp4', 'https://picsum.photos/seed/clip-1/320/400',
        120, 152, 32, 'COMPLETED', 152000),
    (2, 'VOD', 1, 1, 1, '경기용인 수비수 신들린 태클',
        'https://vod.example.com/clip/002.mp4', 'https://picsum.photos/seed/clip-2/320/400',
        200, 265, 65, 'COMPLETED', 98400),
    (3, 'VOD', 1, 1, 1, '대구강북 에이스 프리킥 골',
        'https://vod.example.com/clip/003.mp4', 'https://picsum.photos/seed/clip-3/320/400',
        300, 348, 48, 'COMPLETED', 87600),
    (4, 'VOD', 2, 2, 1, '결승골 세리머니 모음',
        'https://vod.example.com/clip/004.mp4', 'https://picsum.photos/seed/clip-4/320/400',
        400, 425, 25, 'COMPLETED', 76300),
    (5, 'VOD', 2, 2, 1, '화랑대기 골키퍼 신들린 세이브',
        'https://vod.example.com/clip/005.mp4', 'https://picsum.photos/seed/clip-5/320/400',
        500, 518, 18, 'COMPLETED', 65100),
    (6, 'VOD', 3, 3, 1, '리틀야구 9회말 역전 홈런',
        'https://vod.example.com/clip/006.mp4', 'https://picsum.photos/seed/clip-6/320/400',
        100, 140, 40, 'COMPLETED', 54200),
    (7, 'VOD', 3, 3, 1, '테니스 매치포인트 에이스 모음',
        'https://vod.example.com/clip/007.mp4', 'https://picsum.photos/seed/clip-7/320/400',
        200, 255, 55, 'COMPLETED', 43100),
    (8, 'VOD', 1, 1, 1, '화랑대기 베스트 프리킥 TOP5',
        'https://vod.example.com/clip/008.mp4', 'https://picsum.photos/seed/clip-8/320/400',
        0, 120, 120, 'COMPLETED', 38700)
ON CONFLICT DO NOTHING;

SELECT setval('content.clip_assets_id_seq', 20, true);

-- ----------------------------------------------------------------------------
-- 8. 배너 (Display Sections)
-- ----------------------------------------------------------------------------
INSERT INTO content.display_sections (id, section_type, title, page, display_order, config, is_active) VALUES
    (1, 'BANNER', '포착 TV 2025 화랑대기 전경기 무료 LIVE 중계', 'HOME', 1,
        '{"subtitle": "유소년 축구 대회의 모든 경기를 포착하세요", "linkUrl": "/contents/live/1", "imageUrl": "https://picsum.photos/seed/banner-1/1280/480"}'::jsonb, TRUE),
    (2, 'BANNER', '제5회 전국 리틀야구 생중계 안내', 'HOME', 2,
        '{"subtitle": "미래의 야구 스타를 만나보세요", "linkUrl": "/contents/live/4", "imageUrl": "https://picsum.photos/seed/banner-2/1280/480"}'::jsonb, TRUE),
    (3, 'BANNER', '제30회 서울시 협회장기 테니스 대회', 'HOME', 3,
        '{"subtitle": "최고의 아마추어 테니스를 감상하세요", "linkUrl": "/contents/live/5", "imageUrl": "https://picsum.photos/seed/banner-3/1280/480"}'::jsonb, TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('content.display_sections_id_seq', 10, true);
