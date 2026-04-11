// LoginView.swift
// Pochak OTT Platform - Login Screen (Redesigned)
// Mirrors Android LoginScreen.kt design spec:
// Top bar, POCHAK logo + tagline, ID/PW card, green login button,
// utility row, 4 SNS pills in a row

import SwiftUI

struct LoginView: View {

    var onLogin: (_ userId: String, _ password: String) -> Void = { _, _ in }
    var onBackClick: () -> Void = {}
    var onSignUp: () -> Void = {}
    var onFindAccount: () -> Void = {}
    var onSnsLogin: (_ provider: String) -> Void = { _ in }

    // Legacy convenience init for existing PochakApp usage
    var onLoginSuccess: (() -> Void)?

    @State private var userId = ""
    @State private var password = ""
    @State private var isPasswordVisible = false
    @State private var keepLoggedIn = true
    @State private var logoAnimated = false

    private var isFormValid: Bool {
        !userId.trimmingCharacters(in: .whitespaces).isEmpty &&
        !password.isEmpty
    }

    var body: some View {
        ZStack {
            // Background
            Color.pochakBgDeep.ignoresSafeArea()
            RadialGradient.pochakLoginGlow.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {

                    // Top Bar
                    topBar

                    Spacer().frame(height: 40)

                    // Logo + Tagline
                    logoSection
                        .opacity(logoAnimated ? 1 : 0)
                        .offset(y: logoAnimated ? 0 : -20)

                    Spacer().frame(height: 60)

                    // Login form card
                    loginFormCard

                    Spacer().frame(height: 20)

                    // Login button
                    loginButton

                    Spacer().frame(height: 16)

                    // Utility row
                    utilityRow

                    Spacer().frame(height: 40)

                    // SNS buttons (4 in a row)
                    snsRow

                    Spacer().frame(height: 60)
                }
                .padding(.horizontal, 24)
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            withAnimation(.easeOut(duration: 0.6).delay(0.15)) {
                logoAnimated = true
            }
        }
        .accessibilityLabel("Login screen")
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            Button {
                onBackClick()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.title3.weight(.medium))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .accessibilityLabel("뒤로 가기")

            Spacer()

            HStack(spacing: 4) {
                Text("한국어")
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextPrimary)
                Text("\u{1F310}") // globe emoji
                    .font(.pochakBody02)
            }
            .accessibilityLabel("언어 선택")
        }
        .padding(.top, 8)
    }

    // MARK: - Logo

    private var logoSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("POCHAK")
                .font(.pochakLogo)
                .foregroundStyle(LinearGradient.pochakLogoGradient)
                .accessibilityAddTraits(.isHeader)

            Text("Connect you play.")
                .font(.pochakBody01)
                .fontWeight(.light)
                .foregroundStyle(Color.pochakTextPrimary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Login Form Card (ID + Password in single rounded card)

    private var loginFormCard: some View {
        VStack(spacing: 0) {
            // ID field
            TextField(
                "",
                text: $userId,
                prompt: Text("ID").foregroundStyle(Color.pochakTextTertiary)
            )
            .font(.pochakBody02)
            .foregroundStyle(Color.pochakTextPrimary)
            .autocapitalization(.none)
            .autocorrectionDisabled()
            .textContentType(.username)
            .padding(.horizontal, 16)
            .padding(.vertical, 16)
            .accessibilityLabel("아이디 입력")

            // Internal divider
            Divider()
                .background(Color.pochakBorder.opacity(0.4))
                .padding(.horizontal, 16)

            // Password field
            HStack {
                Group {
                    if isPasswordVisible {
                        TextField(
                            "",
                            text: $password,
                            prompt: Text("Password").foregroundStyle(Color.pochakTextTertiary)
                        )
                    } else {
                        SecureField(
                            "",
                            text: $password,
                            prompt: Text("Password").foregroundStyle(Color.pochakTextTertiary)
                        )
                    }
                }
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextPrimary)
                .textContentType(.password)
                .accessibilityLabel("비밀번호 입력")

                Button {
                    isPasswordVisible.toggle()
                } label: {
                    Image(systemName: isPasswordVisible ? "eye" : "eye.slash")
                        .foregroundStyle(Color.pochakTextTertiary)
                }
                .accessibilityLabel(isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 16)
        }
        .background(Color.pochakSurfaceVar)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
        )
    }

    // MARK: - Login Button

    private var loginButton: some View {
        Button {
            if let onLoginSuccess {
                onLoginSuccess()
            } else {
                onLogin(userId, password)
            }
        } label: {
            Text("로그인")
        }
        .buttonStyle(PochakPrimaryButtonStyle(isEnabled: isFormValid))
        .accessibilityLabel("로그인 버튼")
        .accessibilityHint("아이디와 비밀번호를 입력 후 눌러주세요")
    }

    // MARK: - Utility Row

    private var utilityRow: some View {
        HStack {
            // Keep logged in
            Button {
                keepLoggedIn.toggle()
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: keepLoggedIn ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(keepLoggedIn ? Color.pochakPrimary : Color.pochakTextTertiary)
                        .font(.system(size: 18))
                    Text("로그인유지")
                        .font(.pochakBody03)
                        .foregroundStyle(keepLoggedIn ? Color.pochakPrimary : Color.pochakTextSecondary)
                }
            }
            .accessibilityLabel("로그인 유지 \(keepLoggedIn ? "활성" : "비활성")")

            Spacer()

            HStack(spacing: 12) {
                Button {
                    onFindAccount()
                } label: {
                    Text("아이디/비밀번호 찾기")
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextSecondary)
                }
                .accessibilityLabel("아이디 또는 비밀번호 찾기")

                Button {
                    onSignUp()
                } label: {
                    Text("회원가입")
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextPrimary)
                }
                .accessibilityLabel("회원가입 페이지로 이동")
            }
        }
    }

    // MARK: - SNS Buttons (4 in a row)

    private var snsRow: some View {
        HStack(spacing: 8) {
            // Kakao
            snsButton(
                label: "\u{1F4AC}", // speech bubble
                backgroundColor: .kakaoYellow,
                contentColor: Color(hex: "#3C1E1E"),
                accessibilityText: "카카오로 로그인",
                provider: "kakao"
            )

            // Naver
            snsButton(
                label: "N",
                backgroundColor: .naverGreen,
                contentColor: .white,
                accessibilityText: "네이버로 로그인",
                provider: "naver",
                isBold: true
            )

            // Google
            snsButton(
                label: "G",
                backgroundColor: .clear,
                contentColor: .white,
                accessibilityText: "Google로 로그인",
                provider: "google",
                isBold: true,
                borderColor: Color.pochakBorder.opacity(0.4)
            )

            // Apple
            snsButton(
                label: "\u{F8FF}", // Apple logo
                backgroundColor: .appleDark,
                contentColor: .white,
                accessibilityText: "Apple로 로그인",
                provider: "apple",
                borderColor: Color.pochakBorder.opacity(0.4)
            )
        }
    }

    private func snsButton(
        label: String,
        backgroundColor: Color,
        contentColor: Color,
        accessibilityText: String,
        provider: String,
        isBold: Bool = false,
        borderColor: Color? = nil
    ) -> some View {
        Button {
            onSnsLogin(provider)
        } label: {
            Text(label)
                .font(.system(size: 20, weight: isBold ? .bold : .regular))
                .foregroundStyle(contentColor)
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(backgroundColor)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    Group {
                        if let borderColor {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(borderColor, lineWidth: 1)
                        }
                    }
                )
        }
        .accessibilityLabel(accessibilityText)
    }
}

// MARK: - Preview

#Preview {
    LoginView()
        .preferredColorScheme(.dark)
}
