-- V105: 클럽 커스터마이징 샘플 시드 데이터
-- 인천남동FC (team_id=5), 서울강남FC (team_id=6), 부산서면유소년 (team_id=7)
-- partner_id=1 (첫 번째 파트너 기준)

INSERT INTO content.club_customizations (club_id, partner_id, banner_url, logo_url, theme_color, intro_text, sections_json, social_links_json, created_at, updated_at)
VALUES
    (5, 1,
     'https://picsum.photos/seed/club-5-banner/1280/480',
     'https://picsum.photos/seed/club-5-logo/200/200',
     '#003087',
     '인천남동FC는 2010년 창단한 유소년 축구 클럽으로, 인천 남동구를 기반으로 지역 축구 인재를 발굴하고 있습니다. 체계적인 트레이닝과 팀워크를 통해 미래의 축구 스타를 양성합니다.',
     '[{"type":"highlights","title":"최근 하이라이트"},{"type":"schedule","title":"경기 일정"},{"type":"members","title":"팀원 소개"}]'::jsonb,
     '{"instagram":"https://instagram.com/incheon_namdong_fc","youtube":"https://youtube.com/@incheon_namdong_fc"}'::jsonb,
     NOW(), NOW()
    ),
    (6, 1,
     'https://picsum.photos/seed/club-6-banner/1280/480',
     'https://picsum.photos/seed/club-6-logo/200/200',
     '#C8102E',
     '서울강남FC는 강남구를 대표하는 엘리트 유소년 축구 클럽입니다. 전문 코치진이 개인 역량 강화와 팀 플레이를 함께 지도하여 최고의 선수를 길러냅니다.',
     '[{"type":"highlights","title":"경기 하이라이트"},{"type":"schedule","title":"다가오는 경기"},{"type":"stats","title":"팀 통계"}]'::jsonb,
     '{"instagram":"https://instagram.com/seoul_gangnam_fc","kakao":"https://open.kakao.com/seoul_gangnam_fc"}'::jsonb,
     NOW(), NOW()
    ),
    (7, 1,
     'https://picsum.photos/seed/club-7-banner/1280/480',
     'https://picsum.photos/seed/club-7-logo/200/200',
     '#FFB81C',
     '부산서면유소년 축구단은 부산 서면 지역의 유소년 선수들을 위한 클럽입니다. 즐거운 축구 문화를 만들어가며 건강한 스포츠 정신을 가르칩니다.',
     '[{"type":"highlights","title":"최신 경기 영상"},{"type":"members","title":"선수 명단"}]'::jsonb,
     '{"instagram":"https://instagram.com/busan_seomyeon_youth","blog":"https://blog.naver.com/busan_seomyeon_fc"}'::jsonb,
     NOW(), NOW()
    )
ON CONFLICT DO NOTHING;
