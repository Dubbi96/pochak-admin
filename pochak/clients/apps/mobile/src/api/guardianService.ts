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
  /**
   * Confirm guardian consent using the verifiedToken obtained from the phone
   * verification step (POST /auth/phone/verify-code with purpose=GUARDIAN).
   */
  verifyGuardian(guardianVerifiedToken: string): Promise<GuardianVerificationResponse>;
}

// ─── Implementation ──────────────────────────────────────────────

class GuardianService implements IGuardianService {
  async verifyGuardian(guardianVerifiedToken: string): Promise<GuardianVerificationResponse> {
    const res = await apiClient.post('/auth/guardian/verify', null, {
      params: { guardianVerifiedToken },
    });
    const data = res.data.data ?? res.data;
    return {
      verified: !!data.verified,
      guardianVerifiedToken: data.guardianVerifiedToken ?? guardianVerifiedToken,
      guardianUserId: data.guardianUserId ?? 0,
      minorAccountCount: data.minorAccountCount ?? 0,
      maxMinorAccounts: data.maxMinorAccounts ?? 5,
    };
  }
}

export const guardianService: IGuardianService = new GuardianService();
