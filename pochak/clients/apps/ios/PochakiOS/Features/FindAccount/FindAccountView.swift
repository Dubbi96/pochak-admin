// FindAccountView.swift
// Pochak OTT Platform - Find Account Screen
// Design ref: [포착3.0] Mobile 디자인 - 아이디/비밀번호 찾기

import SwiftUI

struct FindAccountView: View {

    var onBackClick: () -> Void = {}
    var onLoginClick: () -> Void = {}
    var onIDResult: ([FoundAccount]) -> Void = { _ in }
    var onPasswordReset: () -> Void = {}

    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            // -- Top bar --
            HStack {
                Button(action: onBackClick) {
                    Image(systemName: "chevron.left")
                        .font(.title3.weight(.medium))
                        .foregroundStyle(Color.pochakTextPrimary)
                }
                .accessibilityLabel("뒤로 가기")

                Spacer()
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 8)

            // -- Title --
            Text("아이디/비밀번호 찾기")
                .font(.pochakTitle03)
                .foregroundStyle(Color.pochakTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)

            Spacer().frame(height: 24)

            // -- Tab row --
            findAccountTabRow

            Spacer().frame(height: 24)

            // -- Tab content --
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    switch selectedTab {
                    case 0:
                        FindIdTabContent()
                    case 1:
                        ResetPasswordTabContent(onPasswordReset: onPasswordReset)
                    default:
                        EmptyView()
                    }
                }
                .padding(.horizontal, 24)
            }

            Spacer()
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    // MARK: - Tab Row

    private var findAccountTabRow: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                ForEach(Array(["아이디 찾기", "비밀번호 재설정"].enumerated()), id: \.offset) { index, title in
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.2)) { selectedTab = index }
                    }) {
                        VStack(spacing: 0) {
                            Text(title)
                                .font(.pochakButton)
                                .foregroundStyle(selectedTab == index ? Color.pochakTextPrimary : Color.pochakTextTertiary)
                                .padding(.vertical, 12)

                            Rectangle()
                                .fill(selectedTab == index ? Color.pochakPrimary : Color.clear)
                                .frame(height: 2)
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 24)

            Divider()
                .background(Color.pochakBorder)
        }
    }
}

// MARK: - Find ID Tab

private struct FindIdTabContent: View {

    @State private var findMethod = 0 // 0=email, 1=phone
    @State private var email = ""
    @State private var phone = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // -- Toggle pills --
            HStack(spacing: 8) {
                TogglePill(
                    text: "이메일로 찾기",
                    isActive: findMethod == 0,
                    onTap: { findMethod = 0 }
                )
                TogglePill(
                    text: "본인인증 찾기",
                    isActive: findMethod == 1,
                    onTap: { findMethod = 1 }
                )
            }

            Spacer().frame(height: 24)

            switch findMethod {
            case 0:
                pochakInputField(text: $email, placeholder: "이메일 주소 입력")
                    .keyboardType(.emailAddress)
            case 1:
                HStack(spacing: 8) {
                    pochakInputField(text: $phone, placeholder: "연락처 본인 인증")
                        .keyboardType(.phonePad)

                    Button(action: { /* TODO: verify */ }) {
                        Text("인증하기")
                            .font(.pochakButton)
                            .foregroundStyle(Color.pochakPrimary)
                    }
                }
            default:
                EmptyView()
            }

            Spacer().frame(height: 32)

            Button(action: { /* TODO: search */ }) {
                Text("조회하기")
            }
            .buttonStyle(PochakPrimaryButtonStyle(isEnabled: findMethod == 0 ? !email.isEmpty : !phone.isEmpty))
            .disabled(findMethod == 0 ? email.isEmpty : phone.isEmpty)
        }
    }
}

// MARK: - Reset Password Tab

private struct ResetPasswordTabContent: View {

    var onPasswordReset: () -> Void = {}

    @State private var userId = ""
    @State private var phone = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            pochakInputField(text: $userId, placeholder: "아이디 입력")

            Spacer().frame(height: 12)

            HStack(spacing: 8) {
                pochakInputField(text: $phone, placeholder: "연락처 본인 인증")
                    .keyboardType(.phonePad)

                Button(action: { /* TODO: verify */ }) {
                    Text("인증하기")
                        .font(.pochakButton)
                        .foregroundStyle(Color.pochakPrimary)
                }
            }

            Spacer().frame(height: 32)

            Button(action: onPasswordReset) {
                Text("비밀번호 재설정")
            }
            .buttonStyle(PochakPrimaryButtonStyle(isEnabled: !userId.isEmpty && !phone.isEmpty))
            .disabled(userId.isEmpty || phone.isEmpty)
        }
    }
}

// MARK: - Toggle Pill

private struct TogglePill: View {

    let text: String
    let isActive: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            Text(text)
                .font(.pochakButton)
                .foregroundStyle(isActive ? Color.pochakTextOnPrimary : Color.pochakTextSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(isActive ? Color.pochakPrimary : .clear)
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(isActive ? Color.pochakPrimary : Color.pochakBorder.opacity(0.4), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.2), value: isActive)
    }
}

// MARK: - Shared Input Field

@ViewBuilder
private func pochakInputField(text: Binding<String>, placeholder: String) -> some View {
    TextField("", text: text, prompt: Text(placeholder).foregroundStyle(Color.pochakTextTertiary))
        .font(.pochakBody01)
        .foregroundStyle(Color.pochakTextPrimary)
        .autocapitalization(.none)
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(Color.pochakSurface)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
        )
}

// MARK: - Preview

#Preview {
    FindAccountView()
        .preferredColorScheme(.dark)
}
