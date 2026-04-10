-- ============================================================================
-- V103: Seed Recording Data
-- 촬영 기능 테스트용 시드 데이터 (POC-19~22)
-- 장소 3곳, 카메라 5대, 촬영일정 5건, 녹화세션 3건, 예약 3건
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Venues (서울, 부산, 대전)
-- ----------------------------------------------------------------------------
INSERT INTO operation.venues (sport_id, name, venue_type, owner_type, owner_id, address, latitude, longitude, is_active)
VALUES
    (1, '잠실종합운동장 보조경기장', 'FIXED', 'B2B', NULL, '서울특별시 송파구 올림픽로 25', 37.5152, 127.0728, TRUE),
    (1, '부산아시아드 주경기장',     'FIXED', 'B2B', NULL, '부산광역시 연제구 월드컵대로 344', 35.1906, 129.0588, TRUE),
    (2, '대전한밭종합운동장',         'FIXED', 'B2B', NULL, '대전광역시 중구 대종로 373', 36.3246, 127.4276, TRUE)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Cameras (5대)
-- ----------------------------------------------------------------------------
INSERT INTO operation.cameras (name, camera_type, product_type, status, serial_number, version, is_panorama, is_active)
VALUES
    ('Pixellot S3 - Seoul Main',   'PIXELLOT', 'S3',   'ACTIVE', 'PXS3-SEL-001', '3.2.1', FALSE, TRUE),
    ('Pixellot S3 - Seoul Pano',   'PIXELLOT', 'S3',   'ACTIVE', 'PXS3-SEL-002', '3.2.1', TRUE,  TRUE),
    ('Pixellot S3 - Busan Main',   'PIXELLOT', 'S3',   'ACTIVE', 'PXS3-BUS-001', '3.2.1', FALSE, TRUE),
    ('Pixellot Air - Daejeon',     'PIXELLOT', 'AIR',  'ACTIVE', 'PXA-DJN-001',  '2.1.0', FALSE, TRUE),
    ('Pochak WebCam - Portable',   'WEBCAM',   'WEB',  'ACTIVE', 'PCK-WEB-001',  '1.0.0', FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Venue-Camera mappings
-- ----------------------------------------------------------------------------
INSERT INTO operation.venue_cameras (venue_id, camera_id, is_main, created_at)
SELECT v.id, c.id, TRUE, NOW()
FROM operation.venues v, operation.cameras c
WHERE v.name = '잠실종합운동장 보조경기장' AND c.serial_number = 'PXS3-SEL-001'
ON CONFLICT DO NOTHING;

INSERT INTO operation.venue_cameras (venue_id, camera_id, is_main, created_at)
SELECT v.id, c.id, FALSE, NOW()
FROM operation.venues v, operation.cameras c
WHERE v.name = '잠실종합운동장 보조경기장' AND c.serial_number = 'PXS3-SEL-002'
ON CONFLICT DO NOTHING;

INSERT INTO operation.venue_cameras (venue_id, camera_id, is_main, created_at)
SELECT v.id, c.id, TRUE, NOW()
FROM operation.venues v, operation.cameras c
WHERE v.name = '부산아시아드 주경기장' AND c.serial_number = 'PXS3-BUS-001'
ON CONFLICT DO NOTHING;

INSERT INTO operation.venue_cameras (venue_id, camera_id, is_main, created_at)
SELECT v.id, c.id, TRUE, NOW()
FROM operation.venues v, operation.cameras c
WHERE v.name = '대전한밭종합운동장' AND c.serial_number = 'PXA-DJN-001'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Recording Schedules (5건 - 다양한 상태)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_user_id BIGINT;
    v_user2_id BIGINT;
    v_seoul_venue_id INT;
    v_busan_venue_id INT;
    v_daejeon_venue_id INT;
    v_cam_seoul_id BIGINT;
    v_cam_busan_id BIGINT;
BEGIN
    SELECT id INTO v_user_id FROM identity.users WHERE username = 'testuser' LIMIT 1;
    SELECT id INTO v_user2_id FROM identity.users WHERE username = 'pochak2026' LIMIT 1;
    SELECT id INTO v_seoul_venue_id FROM operation.venues WHERE name = '잠실종합운동장 보조경기장' LIMIT 1;
    SELECT id INTO v_busan_venue_id FROM operation.venues WHERE name = '부산아시아드 주경기장' LIMIT 1;
    SELECT id INTO v_daejeon_venue_id FROM operation.venues WHERE name = '대전한밭종합운동장' LIMIT 1;
    SELECT id INTO v_cam_seoul_id FROM operation.cameras WHERE serial_number = 'PXS3-SEL-001' LIMIT 1;
    SELECT id INTO v_cam_busan_id FROM operation.cameras WHERE serial_number = 'PXS3-BUS-001' LIMIT 1;

    IF v_user_id IS NOT NULL AND v_seoul_venue_id IS NOT NULL THEN

        -- Schedule 1: 예정된 촬영 (다음주 토요일)
        INSERT INTO operation.recording_schedules (user_id, venue_id, title, start_time, end_time, memo, status, is_active)
        VALUES (v_user_id, v_seoul_venue_id, '잠실 축구 A리그 3R 촬영', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 2 hours', '홈팀 벤치 쪽 카메라 세팅 필요', 'SCHEDULED', TRUE);

        -- Schedule 2: 예정된 촬영 (내일)
        INSERT INTO operation.recording_schedules (user_id, venue_id, title, start_time, end_time, memo, status, is_active)
        VALUES (v_user_id, v_busan_venue_id, '부산 K5리그 개막전 촬영', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours 30 minutes', '파노라마 촬영 불필요, 메인 카메라만', 'SCHEDULED', TRUE);

        -- Schedule 3: 진행 중인 촬영
        INSERT INTO operation.recording_schedules (user_id, venue_id, title, start_time, end_time, memo, status, is_active)
        VALUES (v_user_id, v_seoul_venue_id, '잠실 풋살 리그 촬영', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '1 hour 30 minutes', NULL, 'IN_PROGRESS', TRUE);

        -- Schedule 4: 완료된 촬영
        INSERT INTO operation.recording_schedules (user_id, venue_id, title, start_time, end_time, memo, status, is_active)
        VALUES (v_user2_id, v_daejeon_venue_id, '대전 농구 교류전 촬영', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 hours', '촬영 완료, VOD 업로드 대기 중', 'COMPLETED', TRUE);

        -- Schedule 5: 취소된 촬영
        INSERT INTO operation.recording_schedules (user_id, venue_id, title, start_time, end_time, memo, status, is_active)
        VALUES (v_user2_id, v_busan_venue_id, '부산 배드민턴 대회 촬영 (취소)', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 3 hours', '우천으로 대회 취소', 'CANCELLED', FALSE);

        -- -----------------------------------------------------------------------
        -- 5. Recording Sessions (3건)
        -- -----------------------------------------------------------------------

        -- Session 1: 현재 녹화 중 (Schedule 3에 연결)
        INSERT INTO operation.recording_sessions (schedule_id, camera_id, user_id, venue_id, status, started_at)
        SELECT rs.id, v_cam_seoul_id, v_user_id, v_seoul_venue_id, 'RECORDING', NOW() - INTERVAL '30 minutes'
        FROM operation.recording_schedules rs
        WHERE rs.title = '잠실 풋살 리그 촬영' AND rs.user_id = v_user_id
        LIMIT 1;

        -- Session 2: 완료된 녹화 (Schedule 4에 연결)
        INSERT INTO operation.recording_sessions (schedule_id, camera_id, user_id, venue_id, status, started_at, completed_at)
        SELECT rs.id, NULL, v_user2_id, v_daejeon_venue_id, 'COMPLETED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour 50 minutes'
        FROM operation.recording_schedules rs
        WHERE rs.title = '대전 농구 교류전 촬영' AND rs.user_id = v_user2_id
        LIMIT 1;

        -- Session 3: 중단된 녹화 (Schedule 4 두번째 시도)
        INSERT INTO operation.recording_sessions (schedule_id, camera_id, user_id, venue_id, status, started_at, stopped_at)
        SELECT rs.id, NULL, v_user2_id, v_daejeon_venue_id, 'PAUSED', NOW() - INTERVAL '3 days' + INTERVAL '10 minutes', NOW() - INTERVAL '3 days' + INTERVAL '25 minutes'
        FROM operation.recording_schedules rs
        WHERE rs.title = '대전 농구 교류전 촬영' AND rs.user_id = v_user2_id
        LIMIT 1;

        -- -----------------------------------------------------------------------
        -- 6. Reservations (3건 - 촬영 일정과 연동)
        -- -----------------------------------------------------------------------

        -- Reservation 1: 잠실 예약 (Schedule 1에 대응)
        INSERT INTO operation.reservations (venue_id, reserved_by_user_id, reservation_type, start_time, end_time, point_cost, status, payment_status, total_price, description)
        VALUES (v_seoul_venue_id, v_user_id, 'REGULAR', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 2 hours', 200, 'CONFIRMED', 'COMPLETED', 200, '잠실 축구 A리그 3R 촬영 예약');

        -- Reservation 2: 부산 예약 (Schedule 2에 대응)
        INSERT INTO operation.reservations (venue_id, reserved_by_user_id, reservation_type, start_time, end_time, point_cost, status, payment_status, total_price, description)
        VALUES (v_busan_venue_id, v_user_id, 'REGULAR', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours 30 minutes', 150, 'PENDING', 'PENDING', 150, '부산 K5리그 개막전 촬영 예약');

        -- Reservation 3: 대전 예약 (Schedule 4에 대응, 완료)
        INSERT INTO operation.reservations (venue_id, reserved_by_user_id, reservation_type, start_time, end_time, point_cost, status, payment_status, total_price, description)
        VALUES (v_daejeon_venue_id, v_user2_id, 'ONE_TIME', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 hours', 100, 'COMPLETED', 'COMPLETED', 100, '대전 농구 교류전 촬영 예약 (완료)');

        -- -----------------------------------------------------------------------
        -- 7. Notification Preferences (기본값)
        -- -----------------------------------------------------------------------
        INSERT INTO operation.recording_notification_preferences (user_id, reminder_enabled, start_enabled)
        VALUES (v_user_id, TRUE, TRUE)
        ON CONFLICT (user_id) DO NOTHING;

        INSERT INTO operation.recording_notification_preferences (user_id, reminder_enabled, start_enabled)
        VALUES (v_user2_id, TRUE, FALSE)
        ON CONFLICT (user_id) DO NOTHING;

    END IF;
END $$;

-- ============================================================================
-- Summary:
--   3 venues (잠실, 부산아시아드, 대전한밭)
--   5 cameras (3x Pixellot S3, 1x Pixellot Air, 1x WebCam)
--   4 venue-camera mappings
--   5 recording schedules (SCHEDULED x2, IN_PROGRESS x1, COMPLETED x1, CANCELLED x1)
--   3 recording sessions (RECORDING x1, COMPLETED x1, PAUSED x1)
--   3 reservations (CONFIRMED x1, PENDING x1, COMPLETED x1)
--   2 notification preferences
-- ============================================================================
