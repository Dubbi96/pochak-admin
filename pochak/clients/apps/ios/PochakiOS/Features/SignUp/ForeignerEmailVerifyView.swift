// ForeignerEmailVerifyView.swift
// Pochak OTT Platform - Foreigner Email Verification Screen
// Design ref: [포착3.0] Mobile 디자인 - Verify email

import SwiftUI

private let emailDomains = [
    "@hogak.co.kr",
    "@gmail.com",
    "@naver.com",
    "@daum.net",
    "@yahoo.com",
]

struct ForeignerEmailVerifyView: View {

    var onBackClick: () -> Void = {}
    var onNextClick: (String) -> Void = { _ in }
    var onSendVerification: (String, @escaping (Bool) -> Void) -> Void = { _, _ in }
    var onResendEmail: (String) -> Void = { _ in }
    var onBackToHome: () -> Void = {}

    @State private var emailPrefix = ""
    @State private var selectedDomain = emailDomains[0]
    @State private var showDomainPicker = false
    @State private var emailSent = false
    @State private var isLoading = false

    private var fullEmail: String { "\(emailPrefix)\(selectedDomain)" }

    var body: some View {
        VStack(spacing: 0) {
            // -- Top Bar --
            signUpTopBar(onBackClick: onBackClick)

            if !emailSent {
                emailInputState
            } else {
                emailSentState
            }
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    // MARK: - Email Input State

    private var emailInputState: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 24)

                    Text("Verify email.")
                        .font(.pochakTitle03)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer().frame(height: 32)

                    // Email input row
                    HStack(spacing: 4) {
                        TextField("", text: $emailPrefix, prompt: Text("email").foregroundStyle(Color.pochakTextTertiary))
                            .font(.pochakBody01)
                            .foregroundStyle(Color.pochakTextPrimary)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(Color.pochakSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                            )

                        // Domain dropdown
                        Menu {
                            ForEach(emailDomains, id: \.self) { domain in
                                Button(action: { selectedDomain = domain }) {
                                    HStack {
                                        Text(domain)
                                        if domain == selectedDomain {
                                            Image(systemName: "checkmark")
                                        }
                                    }
                                }
                            }
                        } label: {
                            HStack(spacing: 4) {
                                Text(selectedDomain)
                                    .font(.pochakBody03)
                                    .foregroundStyle(Color.pochakTextPrimary)
                                    .lineLimit(1)
                                Image(systemName: "chevron.down")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.pochakTextPrimary)
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 14)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                            )
                        }
                    }
                }
                .padding(.horizontal, 24)
            }

            // -- Bottom Button --
            VStack {
                Button(action: {
                    isLoading = true
                    onSendVerification(fullEmail) { success in
                        isLoading = false
                        if success { emailSent = true }
                    }
                }) {
                    Text("Next")
                }
                .buttonStyle(PochakPrimaryButtonStyle(isEnabled: !emailPrefix.isEmpty && !isLoading))
                .disabled(emailPrefix.isEmpty || isLoading)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)
            .background(Color.pochakBg)
        }
    }

    // MARK: - Email Sent State

    private var emailSentState: some View {
        VStack(spacing: 0) {
            Spacer()

            Text("Verification email sent.")
                .font(.pochakTitle03)
                .foregroundStyle(Color.pochakTextPrimary)
                .multilineTextAlignment(.center)

            Spacer().frame(height: 12)

            Text("Please check your inbox.")
                .font(.pochakBody01)
                .foregroundStyle(Color.pochakTextSecondary)
                .multilineTextAlignment(.center)

            Spacer().frame(height: 8)

            Text(fullEmail)
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakPrimary)
                .multilineTextAlignment(.center)

            Spacer().frame(height: 40)

            Button(action: onBackToHome) {
                Text("Back to Home")
            }
            .buttonStyle(PochakPrimaryButtonStyle(isEnabled: true))
            .padding(.horizontal, 24)

            Spacer().frame(height: 16)

            Button(action: { onResendEmail(fullEmail) }) {
                Text("Resend Email")
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakPrimary)
            }
            .padding(.vertical, 8)

            Spacer()
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - Preview

#Preview("Input") {
    ForeignerEmailVerifyView()
        .preferredColorScheme(.dark)
}
