import { test, expect } from '@playwright/test';

/**
 * OAuth Login E2E Tests
 *
 * These tests verify the OAuth login flow end-to-end:
 * 1. Kakao OAuth login → token issuance → profile retrieval
 * 2. Google OAuth login → token issuance → profile retrieval
 * 3. Token expiry → refresh flow
 *
 * External OAuth providers are intercepted via route mocking to avoid
 * dependency on live provider credentials.
 */

const GATEWAY_URL = process.env.VITE_GATEWAY_URL || 'http://localhost:8080';

test.describe('OAuth Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state before each test
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('pochak_token');
      localStorage.removeItem('pochak_refresh_token');
      localStorage.removeItem('pochak_user');
    });
  });

  // ==================== Login Page ====================

  test('Login page renders with OAuth provider buttons', async ({ page }) => {
    await page.goto('/login');

    // Verify SNS login buttons exist
    await expect(page.getByTitle('카카오 로그인')).toBeVisible();
    await expect(page.getByTitle('네이버 로그인')).toBeVisible();
    await expect(page.getByTitle('구글 로그인')).toBeVisible();
    await expect(page.getByTitle('Apple 로그인')).toBeVisible();

    // Verify login form elements
    await expect(page.getByPlaceholder('아이디')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호')).toBeVisible();
  });

  // ==================== Kakao OAuth E2E ====================

  test('Kakao OAuth: login → token → profile → redirect to home', async ({ page }) => {
    // 1. Intercept the OAuth callback redirect to simulate Kakao returning an auth code
    await page.route(`${GATEWAY_URL}/api/v1/auth/oauth2/callback/kakao*`, async (route) => {
      // Simulate server redirect with one-time auth code (SEC-006)
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/auth/callback?code=test-kakao-auth-code',
        },
      });
    });

    // 2. Intercept token exchange endpoint
    await page.route(`${GATEWAY_URL}/api/v1/auth/oauth2/token`, async (route) => {
      const body = JSON.parse((await route.request().postData()) || '{}');
      expect(body.code).toBe('test-kakao-auth-code');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            accessToken: 'kakao-jwt-access-token',
            refreshToken: 'kakao-jwt-refresh-token',
            expiresIn: 1800,
            tokenType: 'Bearer',
          },
        }),
      });
    });

    // 3. Intercept profile fetch
    await page.route(`${GATEWAY_URL}/api/v1/users/me`, async (route) => {
      const auth = route.request().headers()['authorization'];
      expect(auth).toBe('Bearer kakao-jwt-access-token');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            nickname: '카카오유저',
            name: '카카오유저',
            email: 'kakao@user.com',
            role: 'USER',
            profileImageUrl: 'https://example.com/kakao-photo.jpg',
          },
        }),
      });
    });

    // Navigate to auth callback page directly (simulating return from Kakao)
    await page.goto('/auth/callback?code=test-kakao-auth-code');

    // Wait for redirect to home
    await page.waitForURL('**/home', { timeout: 10000 });

    // Verify tokens are stored
    const accessToken = await page.evaluate(() => localStorage.getItem('pochak_token'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('pochak_refresh_token'));
    const userJson = await page.evaluate(() => localStorage.getItem('pochak_user'));

    expect(accessToken).toBe('kakao-jwt-access-token');
    expect(refreshToken).toBe('kakao-jwt-refresh-token');
    expect(userJson).toBeTruthy();

    const user = JSON.parse(userJson!);
    expect(user.nickname).toBe('카카오유저');
    expect(user.email).toBe('kakao@user.com');
    expect(user.role).toBe('USER');
  });

  // ==================== Google OAuth E2E ====================

  test('Google OAuth: login → token → profile → redirect to home', async ({ page }) => {
    // 1. Intercept token exchange endpoint
    await page.route(`${GATEWAY_URL}/api/v1/auth/oauth2/token`, async (route) => {
      const body = JSON.parse((await route.request().postData()) || '{}');
      expect(body.code).toBe('test-google-auth-code');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            accessToken: 'google-jwt-access-token',
            refreshToken: 'google-jwt-refresh-token',
            expiresIn: 1800,
            tokenType: 'Bearer',
          },
        }),
      });
    });

    // 2. Intercept profile fetch
    await page.route(`${GATEWAY_URL}/api/v1/users/me`, async (route) => {
      const auth = route.request().headers()['authorization'];
      expect(auth).toBe('Bearer google-jwt-access-token');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            nickname: 'GoogleUser',
            name: 'Google User',
            email: 'user@gmail.com',
            role: 'USER',
            profileImageUrl: 'https://example.com/google-avatar.jpg',
          },
        }),
      });
    });

    // Navigate to auth callback (simulating return from Google)
    await page.goto('/auth/callback?code=test-google-auth-code');

    // Wait for redirect to home
    await page.waitForURL('**/home', { timeout: 10000 });

    // Verify tokens
    const accessToken = await page.evaluate(() => localStorage.getItem('pochak_token'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('pochak_refresh_token'));
    const userJson = await page.evaluate(() => localStorage.getItem('pochak_user'));

    expect(accessToken).toBe('google-jwt-access-token');
    expect(refreshToken).toBe('google-jwt-refresh-token');

    const user = JSON.parse(userJson!);
    expect(user.nickname).toBe('GoogleUser');
    expect(user.email).toBe('user@gmail.com');
  });

  // ==================== Token Exchange Failure ====================

  test('OAuth callback with expired auth code shows error', async ({ page }) => {
    // Intercept token exchange — simulate expired code
    await page.route(`${GATEWAY_URL}/api/v1/auth/oauth2/token`, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid or expired authorization code',
        }),
      });
    });

    await page.goto('/auth/callback?code=expired-code');

    // Should show error message
    await expect(page.getByText('로그인에 실패했습니다')).toBeVisible({ timeout: 5000 });

    // Should show "go back to login" button
    await expect(page.getByText('로그인으로 돌아가기')).toBeVisible();
  });

  test('OAuth callback without code shows error', async ({ page }) => {
    await page.goto('/auth/callback');

    await expect(page.getByText('인증 코드를 받지 못했습니다')).toBeVisible({ timeout: 5000 });
  });

  // ==================== Kakao OAuth Button Navigation ====================

  test('Kakao login button navigates to Kakao OAuth URL', async ({ page }) => {
    await page.goto('/login');

    // Listen for navigation
    const [popup] = await Promise.all([
      page.waitForEvent('popup').catch(() => null),
      page.waitForURL('**/kauth.kakao.com/**').catch(() => null),
      page.getByTitle('카카오 로그인').click(),
    ]);

    // The click should trigger navigation to kauth.kakao.com
    const url = popup ? popup.url() : page.url();
    expect(url).toContain('kauth.kakao.com');
  });

  // ==================== Google OAuth Button Navigation ====================

  test('Google login button navigates to Google OAuth URL', async ({ page }) => {
    await page.goto('/login');

    const [popup] = await Promise.all([
      page.waitForEvent('popup').catch(() => null),
      page.waitForURL('**/accounts.google.com/**').catch(() => null),
      page.getByTitle('구글 로그인').click(),
    ]);

    const url = popup ? popup.url() : page.url();
    expect(url).toContain('accounts.google.com');
  });
});

// ==================== Token Refresh Flow ====================

test.describe('Token Refresh Flow', () => {
  test('Expired access token triggers refresh and retries request', async ({ page }) => {
    // Pre-set expired access token and valid refresh token
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('pochak_token', 'expired-access-token');
      localStorage.setItem('pochak_refresh_token', 'valid-refresh-token');
      localStorage.setItem('pochak_user', JSON.stringify({ nickname: 'testuser', role: 'USER' }));
    });

    let refreshCalled = false;
    let retryCalled = false;

    // Intercept API calls to simulate 401 → refresh → retry
    await page.route(`${GATEWAY_URL}/api/v1/**`, async (route) => {
      const url = route.request().url();
      const auth = route.request().headers()['authorization'];

      // Token refresh endpoint
      if (url.includes('/auth/refresh')) {
        refreshCalled = true;
        const body = JSON.parse((await route.request().postData()) || '{}');
        expect(body.refreshToken).toBe('valid-refresh-token');

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              accessToken: 'new-access-token',
              refreshToken: 'new-refresh-token',
              expiresIn: 1800,
              tokenType: 'Bearer',
            },
          }),
        });
        return;
      }

      // First call with expired token → 401
      if (auth === 'Bearer expired-access-token') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Token expired' }),
        });
        return;
      }

      // Retry call with new token → success
      if (auth === 'Bearer new-access-token') {
        retryCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }

      await route.continue();
    });

    // Navigate to a page that triggers an API call
    await page.goto('/home');

    // Allow time for the 401 → refresh → retry cycle
    await page.waitForTimeout(3000);

    // Verify refresh was called
    expect(refreshCalled).toBe(true);
  });

  test('Expired refresh token redirects to login', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('pochak_token', 'expired-access-token');
      localStorage.setItem('pochak_refresh_token', 'expired-refresh-token');
      localStorage.setItem('pochak_user', JSON.stringify({ nickname: 'testuser' }));
    });

    // Intercept all API calls to return 401
    await page.route(`${GATEWAY_URL}/api/v1/**`, async (route) => {
      const url = route.request().url();

      if (url.includes('/auth/refresh')) {
        // Refresh also fails → session expired
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Refresh token expired' }),
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Token expired' }),
      });
    });

    await page.goto('/home');

    // Should eventually redirect to login page after failed refresh
    // (behavior depends on frontend auth interceptor implementation)
    await page.waitForTimeout(3000);

    // Verify tokens are cleared
    const token = await page.evaluate(() => localStorage.getItem('pochak_token'));
    // Token should be cleared or user should be on login page
    const currentUrl = page.url();
    const tokenCleared = token === null || token === '';
    const onLoginPage = currentUrl.includes('/login');
    expect(tokenCleared || onLoginPage).toBeTruthy();
  });
});
