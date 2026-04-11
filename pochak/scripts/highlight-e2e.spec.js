// @ts-check
const { test, expect } = require('@playwright/test');

// ============================================================
// Web (localhost:3300) - 하이라이트 기능
// ============================================================
test.describe('Web 하이라이트 기능 (localhost:3300)', () => {
  const webBase = 'http://localhost:3300';

  async function checkWebAvailable(page) {
    try {
      await page.goto(webBase, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async function loginWeb(page) {
    try {
      await page.goto(`${webBase}/login`, { timeout: 5000 });
      await page.locator('input[type="email"], input[name="email"]').first().fill('test@pochak.live');
      await page.locator('input[type="password"]').first().fill('test1234!');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
    } catch {
      // 로그인 실패 허용
    }
  }

  test('영상 플레이어에서 하이라이트 감지 버튼 클릭', async ({ page }) => {
    const available = await checkWebAvailable(page);
    if (!available) {
      expect(available, 'Web 서비스(localhost:3300)가 실행되지 않음 - 하이라이트 감지 테스트 불가').toBe(true);
      return;
    }

    await loginWeb(page);

    // 영상이 있는 페이지로 이동 (클럽 영상 또는 하이라이트 전용 페이지)
    const videoPaths = ['/clubs', '/videos', '/highlights', '/home'];
    let videoFound = false;

    for (const path of videoPaths) {
      await page.goto(`${webBase}${path}`, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1500);

      const videoEl = page.locator('video').first();
      if (await videoEl.isVisible().catch(() => false)) {
        videoFound = true;
        break;
      }
    }

    // 하이라이트 감지 버튼 확인
    const highlightBtn = page.locator(
      'button:has-text("하이라이트"), button:has-text("감지"), button[class*="highlight"], [data-testid*="highlight"]'
    ).first();
    const hasHighlightBtn = await highlightBtn.isVisible().catch(() => false);

    expect.soft(videoFound, '영상 플레이어가 있는 페이지가 있어야 함').toBe(true);
    expect(hasHighlightBtn, '하이라이트 감지 버튼이 존재해야 함').toBe(true);

    if (hasHighlightBtn) {
      await highlightBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test('API 호출 → mock 하이라이트 생성 확인', async ({ page }) => {
    const available = await checkWebAvailable(page);
    if (!available) {
      expect(available, 'Web 서비스(localhost:3300)가 실행되지 않음 - 하이라이트 API 테스트 불가').toBe(true);
      return;
    }

    const highlightApiCalls = [];
    page.on('response', res => {
      if (res.url().includes('/highlight') || res.url().includes('/ai-highlight')) {
        highlightApiCalls.push({ url: res.url(), status: res.status() });
      }
    });

    await loginWeb(page);
    await page.goto(`${webBase}/clubs`, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // 하이라이트 감지 버튼 클릭
    const highlightBtn = page.locator(
      'button:has-text("하이라이트"), button:has-text("감지"), button[class*="highlight"]'
    ).first();
    if (await highlightBtn.isVisible().catch(() => false)) {
      await highlightBtn.click();
      await page.waitForTimeout(3000);
    }

    expect.soft(highlightApiCalls.length, '하이라이트 API가 1회 이상 호출되어야 함').toBeGreaterThan(0);

    const successCall = highlightApiCalls.find(c => c.status >= 200 && c.status < 300);
    expect(
      successCall !== undefined || highlightApiCalls.length === 0,
      '하이라이트 API 호출이 성공해야 함 (하이라이트 버튼 없으면 페이지 구현 확인 필요)'
    ).toBe(true);
  });

  test('시크바에 하이라이트 마커 표시 확인', async ({ page }) => {
    const available = await checkWebAvailable(page);
    if (!available) {
      expect(available, 'Web 서비스(localhost:3300)가 실행되지 않음 - 마커 표시 테스트 불가').toBe(true);
      return;
    }

    await loginWeb(page);
    await page.goto(`${webBase}/clubs`, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // 하이라이트 감지 후 마커 확인
    const highlightBtn = page.locator(
      'button:has-text("하이라이트"), button:has-text("감지"), button[class*="highlight"]'
    ).first();

    if (await highlightBtn.isVisible().catch(() => false)) {
      await highlightBtn.click();
      await page.waitForTimeout(3000);
    }

    // 시크바 마커 확인 (progressbar, seekbar, timeline 위의 marker)
    const markers = page.locator(
      '[class*="marker"], [class*="highlight-point"], [data-testid*="marker"], .seekbar-marker'
    );
    const markerCount = await markers.count();

    expect.soft(markerCount, '시크바에 하이라이트 마커가 표시되어야 함').toBeGreaterThan(0);
  });

  test('마커 클릭 → 해당 시점 이동 확인', async ({ page }) => {
    const available = await checkWebAvailable(page);
    if (!available) {
      expect(available, 'Web 서비스(localhost:3300)가 실행되지 않음 - 마커 클릭 테스트 불가').toBe(true);
      return;
    }

    await loginWeb(page);
    await page.goto(`${webBase}/clubs`, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // 마커가 있으면 첫 번째 클릭
    const firstMarker = page.locator(
      '[class*="marker"], [class*="highlight-point"], [data-testid*="marker"]'
    ).first();

    const hasMarker = await firstMarker.isVisible().catch(() => false);
    if (!hasMarker) {
      expect.soft(hasMarker, '시크바 마커가 없어 클릭 테스트 불가 (하이라이트 감지 미완료 또는 Web 미실행)').toBe(true);
      return;
    }

    // 클릭 전 비디오 currentTime 저장
    const video = page.locator('video').first();
    const beforeTime = await video.evaluate((v) => v.currentTime).catch(() => -1);

    await firstMarker.click();
    await page.waitForTimeout(1000);

    const afterTime = await video.evaluate((v) => v.currentTime).catch(() => -1);
    expect(afterTime !== beforeTime, '마커 클릭 후 비디오 재생 시점이 변경되어야 함').toBe(true);
  });

  test('사이드패널 하이라이트 목록 표시 확인', async ({ page }) => {
    const available = await checkWebAvailable(page);
    if (!available) {
      expect(available, 'Web 서비스(localhost:3300)가 실행되지 않음 - 사이드패널 테스트 불가').toBe(true);
      return;
    }

    await loginWeb(page);
    await page.goto(`${webBase}/clubs`, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // 사이드패널 또는 하이라이트 목록 패널 확인
    const sidePanel = page.locator(
      '[class*="side-panel"], [class*="SidePanel"], [class*="highlight-list"], [class*="HighlightList"]'
    ).first();

    const hasSidePanel = await sidePanel.isVisible().catch(() => false);
    expect.soft(hasSidePanel, '하이라이트 사이드패널이 표시되어야 함').toBe(true);

    if (hasSidePanel) {
      // 하이라이트 항목이 있는지 확인
      const items = sidePanel.locator('[class*="item"], li, [role="listitem"]');
      const itemCount = await items.count();
      expect.soft(itemCount, '사이드패널에 하이라이트 항목이 있어야 함').toBeGreaterThan(0);
    }
  });
});

// ============================================================
// BO (localhost:3000) - 하이라이트 관리
// ============================================================
test.describe('BO 하이라이트 관리 (localhost:3000)', () => {
  test('BO 하이라이트 관리 페이지 접근 확인', async ({ page }) => {
    const loginApiResponses = [];
    page.on('response', res => {
      if (res.url().includes('/auth/login')) {
        loginApiResponses.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto('http://localhost:3000/login', { timeout: 5000 });

    // ID/PW 입력 (BO는 #username/#password 또는 input[name="username"])
    const usernameInput = page.locator('#username, input[name="username"], input[placeholder*="아이디"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await usernameInput.fill('admin');
    await passwordInput.fill('admin1234!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    const loggedIn = !page.url().includes('/login');

    if (!loggedIn) {
      // BUG-002: BO 로그인 토큰 미발급 버그
      const loginResp = loginApiResponses.find(r => r.url.includes('auth/login'));
      const hasApiResponse = loginResp !== undefined;
      expect.soft(hasApiResponse, '[BUG-002] BO 로그인 API가 호출되지 않음 — auth/login 응답 없음').toBe(true);
      expect.soft(loggedIn, '[BUG-002] BO 로그인 실패로 하이라이트 관리 페이지 접근 불가').toBe(true);
      return;
    }

    // 하이라이트 관리 페이지 이동
    const highlightPaths = ['/highlights', '/ai-highlights', '/clubs/highlights'];
    let pageFound = false;

    for (const path of highlightPaths) {
      await page.goto(`http://localhost:3000${path}`, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1500);

      const is404 = await page.locator('text=404, text=찾을 수 없습니다').isVisible().catch(() => false);
      const redirectedToLogin = page.url().includes('/login');

      if (!is404 && !redirectedToLogin) {
        pageFound = true;
        break;
      }
    }

    expect(pageFound, 'BO 하이라이트 관리 페이지가 접근 가능해야 함').toBe(true);

    if (pageFound) {
      // 실제 데이터 표시 확인
      await page.waitForTimeout(2000);
      const rows = page.locator('tr, [class*="highlight-row"], [class*="HighlightRow"]');
      const count = await rows.count();
      expect.soft(count, 'BO 하이라이트 목록에 데이터가 있어야 함').toBeGreaterThan(0);
    }
  });
});
