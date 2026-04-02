/**
 * API layer barrel export.
 *
 * All domain services follow the extensible interface pattern:
 *   1. IXxxService interface  — stable contract for consumers
 *   2. XxxService class       — concrete implementation (mock for Phase 4A)
 *   3. xxxService singleton   — ready-to-use instance
 *
 * Migration: swap the class implementation to call real APIs;
 * consumer code remains untouched.
 */

export { default as apiClient } from './client';

export { homeService } from './homeService';
export type { IHomeService, HomeResponse } from './homeService';

export { contentService } from './contentService';
export type { IContentService, ContentDetailResponse } from './contentService';

export { playerService } from './playerService';
export type { IPlayerService, PlayerData, TimelineEvent } from './playerService';

export { searchService } from './searchService';
export type { ISearchService } from './searchService';

export { authService } from './authService';
export type {
  IAuthService,
  SignInRequest,
  SignInResponse,
  SignUpData,
  SignupData,
  SignupRoute,
  ConsentItem,
  MarketingChannels,
  SignupPreferences,
  TokenResponse,
} from './authService';

export { phoneVerificationService } from './phoneVerificationService';
export type {
  IPhoneVerificationService,
  VerificationPurpose,
  SendCodeResponse,
  VerifyCodeResponse,
  PhoneRegistrationInfo,
} from './phoneVerificationService';

export { guardianService } from './guardianService';
export type {
  IGuardianService,
  GuardianVerificationResponse,
} from './guardianService';

export { commerceService } from './commerceService';
export type { ICommerceService, EntitlementInfo, PurchaseRequest } from './commerceService';

export { userService } from './userService';
export type { IUserService } from './userService';

export { streamingService } from './streamingService';
export type {
  IStreamingService,
  StreamInfo,
  CameraView,
  QualityLevel,
  DrmConfig,
} from './streamingService';
