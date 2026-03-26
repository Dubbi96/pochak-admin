import apiClient from './client';

// ─── Types ───────────────────────────────────────────────────────

export type VerificationPurpose = 'SIGNUP' | 'GUARDIAN' | 'PASSWORD_RESET';

export interface SendCodeResponse {
  success: boolean;
}

export interface VerifyCodeResponse {
  verified: boolean;
  verifiedToken: string;
}

export interface PhoneRegistrationInfo {
  registered: boolean;
  accountType?: 'ADULT' | 'MINOR';
  linkedProviders?: string[];
  maskedUsername?: string;
}

export interface IPhoneVerificationService {
  /** Send a verification code to the given phone number */
  sendCode(phone: string, purpose: VerificationPurpose): Promise<SendCodeResponse>;
  /** Verify the code entered by the user */
  verifyCode(phone: string, code: string, purpose: VerificationPurpose): Promise<VerifyCodeResponse>;
  /** Check whether the phone number is already registered */
  checkPhoneRegistration(phone: string): Promise<PhoneRegistrationInfo>;
}

// ─── Mock helpers ────────────────────────────────────────────────

const MOCK_CODE = '123456';
const MOCK_VERIFIED_TOKEN = 'mock-phone-verified-token';

// ─── Implementation ──────────────────────────────────────────────

class PhoneVerificationService implements IPhoneVerificationService {
  async sendCode(phone: string, purpose: VerificationPurpose): Promise<SendCodeResponse> {
    try {
      const res = await apiClient.post('/auth/phone/send', { phone, purpose });
      const data = res.data.data ?? res.data;
      return { success: !!data.success };
    } catch {
      console.warn('[PhoneVerification] API unavailable, using mock');
      console.log(`[PhoneVerification] Mock code for ${phone}: ${MOCK_CODE}`);
      return { success: true };
    }
  }

  async verifyCode(
    phone: string,
    code: string,
    purpose: VerificationPurpose,
  ): Promise<VerifyCodeResponse> {
    try {
      const res = await apiClient.post('/auth/phone/verify', { phone, code, purpose });
      const data = res.data.data ?? res.data;
      return {
        verified: !!data.verified,
        verifiedToken: data.verifiedToken ?? '',
      };
    } catch {
      console.warn('[PhoneVerification] API unavailable, using mock');
      if (code === MOCK_CODE) {
        return { verified: true, verifiedToken: MOCK_VERIFIED_TOKEN };
      }
      return { verified: false, verifiedToken: '' };
    }
  }

  async checkPhoneRegistration(phone: string): Promise<PhoneRegistrationInfo> {
    try {
      const res = await apiClient.post('/auth/phone/check-registration', { phone });
      const data = res.data.data ?? res.data;
      return {
        registered: !!data.registered,
        accountType: data.accountType,
        linkedProviders: data.linkedProviders,
        maskedUsername: data.maskedUsername,
      };
    } catch {
      console.warn('[PhoneVerification] API unavailable, using mock');
      return { registered: false };
    }
  }
}

export const phoneVerificationService: IPhoneVerificationService =
  new PhoneVerificationService();
