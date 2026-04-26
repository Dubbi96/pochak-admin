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

// ─── Implementation ──────────────────────────────────────────────

class PhoneVerificationService implements IPhoneVerificationService {
  async sendCode(phone: string, purpose: VerificationPurpose): Promise<SendCodeResponse> {
    const res = await apiClient.post('/auth/phone/send-code', { phone, purpose });
    const data = res.data.data ?? res.data;
    return { success: !!data.success };
  }

  async verifyCode(
    phone: string,
    code: string,
    purpose: VerificationPurpose,
  ): Promise<VerifyCodeResponse> {
    const res = await apiClient.post('/auth/phone/verify-code', { phone, code, purpose });
    const data = res.data.data ?? res.data;
    return {
      verified: !!data.verified,
      verifiedToken: data.verifiedToken ?? data.verifiedToken ?? '',
    };
  }

  async checkPhoneRegistration(phone: string): Promise<PhoneRegistrationInfo> {
    const res = await apiClient.get('/auth/phone/check', { params: { phone } });
    const data = res.data.data ?? res.data;
    return {
      registered: !!data.registered,
      accountType: data.accountType,
      linkedProviders: data.linkedProviders,
      maskedUsername: data.maskedUsername,
    };
  }
}

export const phoneVerificationService: IPhoneVerificationService =
  new PhoneVerificationService();
