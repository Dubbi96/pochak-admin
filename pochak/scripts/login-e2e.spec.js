// @ts-check
const { test, expect } = require('@playwright/test');

// ============================================================
// BO (localhost:3000) - Next.js SSR admin back-office
// ============================================================
test.describe('BO 로그인 (localhost:3000)', () => {
  test('정상 로그인 시 토큰 반환 및 대시보드 진입 확인', async ({ page }) => {
    const loginApiResponses = [];
    page.on('response', (response) => {
      if (response.url().includes('/auth/login')) {
        loginApiResponses.push({ url: response.url(), status: response.status() });
      }
    });

    await page.goto('http://localhost:3000/login');
    await expect(page).toHaveTitle(/POCHAK/i);

    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin1234!');
    await page.click('button[type="submit"]');

    // 로그인 API 호출 확인
    await page.waitForTimeout(3000);

    const loginResp = loginApiResponses.find(r => r.url.includes('auth/login'));
    expect(loginResp, '로그인 API 호출되어야 함').toBeTruthy();
    expect(loginResp.status, '로그인 API 200 응답').toBe(200);

    // 에러 메시지 없음 확인 (서버 연결 실패 메시지가 있으면 실패)
    const serverError = await page.locator('text=/서버에 연결할 수 없습니다/').isVisible().catch(() => false);
    expect(serverError, '서버 연결 에러가 없어야 함 (백엔드가 빈 응답 반환 중 - BUG)').toBe(false);

    // 대시보드 진입 확인
    const url = page.url();
    expect(url, '로그인 후 대시보드로 이동해야 함').not.toContain('/login');
  });

  test('API 401 에러 없음 (로그인 후 인증 토큰 유효성)', async ({ page }) => {
    const api401Errors = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/') && response.status() === 401) {
        api401Errors.push(response.url());
      }
    });

    await page.goto('http://localhost:3000/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 401 에러 없음 (로그인 실패시에는 이 테스트 자체가 무의미하므로 기록만)
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      // 실제로 로그인된 경우에만 401 체크
      expect(api401Errors).toHaveLength(0);
    } else {
      // 로그인 자체가 실패한 경우 - 이것이 더 큰 버그
      test.fail(true, '로그인 실패로 인해 대시보드 진입 불가. 백엔드 토큰 반환 버그 확인 필요');
    }
  });

  test('잘못된 비밀번호 → 에러 메시지 표시', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('#username', 'admin');
    await page.fill('#password', 'wrongpassword123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // 에러 메시지가 표시되고 로그인 페이지에 머무름
    const stillOnLogin = page.url().includes('/login') || page.url() === 'http://localhost:3000/';
    expect(stillOnLogin, '잘못된 비밀번호 후 로그인 페이지에 머물러야 함').toBe(true);

    // 에러 메시지 확인 (서버 에러 OR 인증 실패 메시지)
    const errorMsg = await page.locator('p.text-red-500, p[class*="red"], [class*="error"]').first().isVisible().catch(() => false);
    expect(errorMsg, '에러 메시지가 표시되어야 함').toBe(true);
  });
});

// ============================================================
// Partner (localhost:3200) - React SPA partner portal
// ============================================================
test.describe('Partner 로그인 (localhost:3200)', () => {
  test('정상 로그인 → 대시보드 진입, CORS 에러 없음', async ({ page }) => {
    const corsErrors = [];
    const loginApiResponses = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('cors')) {
        corsErrors.push(msg.text());
      }
    });
    page.on('requestfailed', (req) => {
      const failure = req.failure();
      if (failure && failure.errorText.toLowerCase().includes('cors')) {
        corsErrors.push(`CORS: ${req.url()}`);
      }
    });
    page.on('response', (response) => {
      if (response.url().includes('/auth/login')) {
        loginApiResponses.push({ url: response.url(), status: response.status() });
      }
    });

    await page.goto('http://localhost:3200/login');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.locator('input[type="email"]').fill('partner@pochak.live');
    await page.locator('input[type="password"]').fill('partner1234!');
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(3000);

    // CORS 에러 없음 확인
    expect(corsErrors, 'CORS 에러가 없어야 함').toHaveLength(0);

    // 로그인 API 호출 확인
    const loginResp = loginApiResponses.find(r => r.url.includes('auth/login'));
    expect(loginResp, '로그인 API 호출되어야 함').toBeTruthy();

    // 대시보드 이동 확인
    const currentUrl = page.url();
    const onDashboard = currentUrl.includes('/dashboard');
    const loginError = await page.locator('text=/비밀번호가 올바르지|로그인 실패|인증 실패/').isVisible().catch(() => false);

    if (!onDashboard) {
      expect.soft(onDashboard, '로그인 후 대시보드로 이동해야 함 - 현재 로그인 실패 (백엔드 토큰 반환 버그)').toBe(true);
    }
  });
});

// ============================================================
// Web (localhost:3300) - React SPA public web
// ============================================================
test.describe('Web 서비스 (localhost:3300)', () => {
  test('서비스 가용성 확인', async ({ page }) => {
    let serviceUp = false;
    try {
      const response = await page.goto('http://localhost:3300', { timeout: 5000 });
      serviceUp = response !== null && response.ok();
    } catch {
      serviceUp = false;
    }
    expect(serviceUp, 'Web 서비스(localhost:3300)가 실행 중이어야 함').toBe(true);
  });

  test('정상 로그인 → 메인 페이지(/home) 진입', async ({ page }) => {
    let serviceAvailable = true;
    try {
      await page.goto('http://localhost:3300/login', { timeout: 5000 });
    } catch {
      serviceAvailable = false;
      expect(serviceAvailable, 'Web 서비스(localhost:3300)가 실행되지 않음 - 로그인 테스트 불가').toBe(true);
      return;
    }

    const emailInput = page.locator('input[type="email"], input[placeholder*="이메일"], input[placeholder*="아이디"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('test@pochak.live');
    await passwordInput.fill('test1234!');
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/(home|$)/, { timeout: 10000 }).catch(() => {});
    const finalUrl = page.url();
    expect(finalUrl, '로그인 후 메인 페이지(/home)로 이동해야 함').not.toContain('/login');
  });

  test('미인증 상태에서 /my 접근 시 /login으로 리다이렉트', async ({ page }) => {
    let serviceAvailable = true;
    try {
      await page.goto('http://localhost:3300', { timeout: 5000 });
    } catch {
      serviceAvailable = false;
      expect(serviceAvailable, 'Web 서비스(localhost:3300)가 실행되지 않음 - 리다이렉트 테스트 불가').toBe(true);
      return;
    }

    // localStorage 초기화 (비인증 상태)
    await page.evaluate(() => {
      localStorage.removeItem('pochak_token');
      localStorage.removeItem('pochak_user');
    });

    await page.goto('http://localhost:3300/my');

    // /login으로 리다이렉트 확인
    await page.waitForURL('**/login**', { timeout: 5000 });
    expect(page.url(), '미인증 /my 접근 시 /login으로 리다이렉트 되어야 함').toContain('/login');
  });
});
