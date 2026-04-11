// GuardianVerificationView.swift
// Pochak OTT Platform - Guardian Verification Screen
// Design ref: [포착3.0] Mobile 디자인 - 법정대리인 본인 인증

import SwiftUI

struct GuardianVerificationView: View {

    var onBackClick: () -> Void = {}
    var onNextClick: (String) -> Void = { _ in }
    var onRequestVerification: (String, @escaping (Bool) -> Void) -> Void = { _, _ in }

    @State private var phoneNumber = ""
    @State private var verificationCode = ""
    @State private var isCodeSent = false
    @State private var isVerified = false
    @State private var isLoading = false
    @State private var verifiedNumber = ""

    var body: some View {
        VStack(spacing: 0) {
            // -- Top Bar --
            signUpTopBar(onBackClick: onBackClick)

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 24)

                    // -- Title --
                    Text("법정대리인 본인 인증")
                        .font(.pochakTitle03)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer().frame(height: 12)

                    // -- Info notice --
                    HStack(spacing: 8) {
                        Image(systemName: "info.circle.fill")
                            .font(.system(size: 18))
                            .foregroundStyle(Color.pochakPrimary)

                        Text("법정대리인 정보는 가입시 함께 보관됩니다.")
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextSecondary)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.pochakSurfaceVar)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

                    Spacer().frame(height: 32)

                    if isVerified {
                        verifiedRow
                    } else if !isCodeSent {
                        phoneInputRow
                    } else {
                        codeInputSection
                    }
                }
                .padding(.horizontal, 24)
            }

            // -- Bottom Button --
            VStack {
                Button(action: { onNextClick(verifiedNumber) }) {
                    Text("다음")
                }
                .buttonStyle(PochakPrimaryButtonStyle(isEnabled: isVerified))
                .disabled(!isVerified)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(Color.pochakBg)
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    // MARK: - Sub-Views

    private var verifiedRow: some View {
        HStack {
            Text(verifiedNumber)
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextPrimary)

            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 24))
                .foregroundStyle(Color.pochakPrimary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 16)
        .background(Color.pochakSurfaceVar)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private var phoneInputRow: some View {
        HStack(spacing: 8) {
            TextField("", text: $phoneNumber, prompt: Text("연락처").foregroundStyle(Color.pochakTextTertiary))
                .font(.pochakBody01)
                .foregroundStyle(Color.pochakTextPrimary)
                .keyboardType(.phonePad)
                .textContentType(.telephoneNumber)
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(Color.pochakSurface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                )

            Button(action: {
                isLoading = true
                onRequestVerification(phoneNumber) { success in
                    isLoading = false
                    if success { isCodeSent = true }
                }
            }) {
                if isLoading {
                    ProgressView()
                        .tint(Color.pochakPrimary)
                } else {
                    Text("인증하기")
                        .font(.pochakButton)
                        .foregroundStyle(Color.pochakPrimary)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .disabled(phoneNumber.isEmpty || isLoading)
        }
    }

    private var codeInputSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(phoneNumber)
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextSecondary)

            Spacer().frame(height: 16)

            HStack(spacing: 8) {
                TextField("", text: $verificationCode, prompt: Text("인증번호 입력").foregroundStyle(Color.pochakTextTertiary))
                    .font(.pochakBody01)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .keyboardType(.numberPad)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(Color.pochakSurface)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                    )

                Button(action: {
                    isVerified = true
                    verifiedNumber = phoneNumber
                }) {
                    Text("확인")
                        .font(.pochakButton)
                }
                .foregroundStyle(Color.pochakTextOnPrimary)
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(verificationCode.count >= 4 ? Color.pochakPrimary : Color.pochakSurfaceVar)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .disabled(verificationCode.count < 4)
            }

            Spacer().frame(height: 8)

            Text("인증번호가 발송되었습니다.")
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextSecondary)
        }
    }
}

// MARK: - Preview

#Preview {
    GuardianVerificationView()
        .preferredColorScheme(.dark)
}
