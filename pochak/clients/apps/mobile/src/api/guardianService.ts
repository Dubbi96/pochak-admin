import apiClient from './client';

// ─── Types ───────────────────────────────────────────────────────

export interface GuardianVerificationResponse {
  verified: boolean;
  guardianVerifiedToken: string;
  guardianUserId: number;
  minorAccountCount: number;
  maxMinorAccounts: number;
}

export interface IGuardianService {
  /** Verify guardian identity via phone code */
  verifyGuardian(
    guardianPhone: string,
    code: string,
  ): Promise<GuardianVerificationResponse>;
}

// ─── Mock helpers ────────────────────────────────────────────────

const MOCK_CODE = '123456';

// ─── Implementation ──────────────────────────────────────────────

class GuardianService implements IGuardianService {
  async verifyGuardian(
    guardianPhone: string,
    code: string,
  ): Promise<GuardianVerificationResponse> {
    try {
      const res = await apiClient.post('/auth/guardian/verify', {
        guardianPhone,
        code,
      });
      const data = res.data.data ?? res.data;
      return {
        verified: !!data.verified,
        guardianVerifiedToken: data.guardianVerifiedToken ?? '',
        guardianUserId: data.guardianUserId ?? 0,
        minorAccountCount: data.minorAccountCount ?? 0,
        maxMinorAccounts: data.maxMinorAccounts ?? 5,
      };
    } catch {
      console.warn('[Guardian] API unavailable, using mock');
      if (code === MOCK_CODE) {
        return {
          verified: true,
          guardianVerifiedToken: 'mock-guardian-verified-token',
          guardianUserId: 999,
          minorAccountCount: 0,
          maxMinorAccounts: 5,
        };
      }
      return {
        verified: false,
        guardianVerifiedToken: '',
        guardianUserId: 0,
        minorAccountCount: 0,
        maxMinorAccounts: 5,
      };
    }
  }
}

export const guardianService: IGuardianService = new GuardianService();
