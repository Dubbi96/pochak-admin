// PasswordResetView.swift
// Pochak OTT Platform - Password Reset Screen
// Design ref: [포착3.0] Mobile 디자인 - 비밀번호 재설정

import SwiftUI

struct PasswordResetView: View {

    var onBackClick: () -> Void = {}
    var onResetComplete: () -> Void = {}

    @State private var password = ""
    @State private var passwordConfirm = ""
    @State private var passwordVisible = false
    @State private var confirmVisible = false

    private var passwordsMatch: Bool {
        !password.isEmpty && !passwordConfirm.isEmpty && password == passwordConfirm
    }

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
            Text("비밀번호 재설정")
                .font(.pochakTitle03)
                .foregroundStyle(Color.pochakTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)

            Spacer().frame(height: 32)

            // -- Password fields card --
            VStack(spacing: 0) {
                passwordCardField(
                    value: $password,
                    placeholder: "비밀번호",
                    isVisible: passwordVisible,
                    onToggleVisibility: { passwordVisible.toggle() }
                )

                Divider()
                    .background(Color.pochakBorder)
                    .padding(.horizontal, 16)

                passwordCardField(
                    value: $passwordConfirm,
                    placeholder: "비밀번호 확인",
                    isVisible: confirmVisible,
                    onToggleVisibility: { confirmVisible.toggle() }
                )
            }
            .background(Color.pochakSurfaceVar)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .padding(.horizontal, 24)

            // -- Mismatch warning --
            if !passwordConfirm.isEmpty && password != passwordConfirm {
                Text("비밀번호가 일치하지 않습니다.")
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakLive)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 24)
                    .padding(.top, 8)
            }

            Spacer()

            // -- Reset button --
            Button(action: onResetComplete) {
                Text("재설정")
            }
            .buttonStyle(PochakPrimaryButtonStyle(isEnabled: passwordsMatch))
            .disabled(!passwordsMatch)
            .padding(.horizontal, 24)

            Spacer().frame(height: 32)
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    // MARK: - Password Card Field

    @ViewBuilder
    private func passwordCardField(
        value: Binding<String>,
        placeholder: String,
        isVisible: Bool,
        onToggleVisibility: @escaping () -> Void
    ) -> some View {
        HStack {
            Group {
                if isVisible {
                    TextField("", text: value, prompt: Text(placeholder).foregroundStyle(Color.pochakTextTertiary))
                } else {
                    SecureField("", text: value, prompt: Text(placeholder).foregroundStyle(Color.pochakTextTertiary))
                }
            }
            .font(.pochakBody02)
            .foregroundStyle(Color.pochakTextPrimary)
            .textContentType(.password)

            Button(action: onToggleVisibility) {
                Image(systemName: isVisible ? "eye" : "eye.slash")
                    .foregroundStyle(Color.pochakTextTertiary)
            }
            .accessibilityLabel(isVisible ? "비밀번호 숨기기" : "비밀번호 보기")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

// MARK: - Preview

#Preview {
    PasswordResetView()
        .preferredColorScheme(.dark)
}
