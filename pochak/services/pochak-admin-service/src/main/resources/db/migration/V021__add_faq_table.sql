-- V021: FAQ 테이블 신규 추가 (항목 57)

CREATE TABLE IF NOT EXISTS admin.faqs (
    id          BIGSERIAL       PRIMARY KEY,
    category    VARCHAR(50)     NOT NULL,
    question    TEXT            NOT NULL,
    answer      TEXT            NOT NULL,
    sort_order  INTEGER         NOT NULL DEFAULT 0,
    active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category_active
    ON admin.faqs (category, active);

COMMENT ON TABLE admin.faqs IS 'FAQ 항목 (사용자향 공개, 관리자향 CRUD)';
COMMENT ON COLUMN admin.faqs.category IS 'FAQ 분류: ACCOUNT, PAYMENT, CONTENT, ETC';

-- 초기 샘플 데이터
INSERT INTO admin.faqs (category, question, answer, sort_order, active) VALUES
('ACCOUNT', '비밀번호를 잊어버렸어요', '로그인 화면에서 [비밀번호 찾기]를 클릭하세요.', 1, true),
('PAYMENT', '구독을 취소하려면 어떻게 하나요?', '[마이페이지] → [구독 관리]에서 취소하실 수 있습니다.', 1, true),
('CONTENT', '영상이 재생되지 않아요', '네트워크 연결을 확인하고 앱을 재시작해보세요.', 1, true);
