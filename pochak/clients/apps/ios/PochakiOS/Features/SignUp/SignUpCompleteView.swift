// SignUpCompleteView.swift
// Pochak OTT Platform - Sign Up Complete Screen
// Design ref: [포착3.0] Mobile 디자인 - 회원가입 완료

import SwiftUI

struct SignUpCompleteView: View {

    var onSubscribe: () -> Void = {}
    var onSkip: () -> Void = {}

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // -- Title --
            Text("회원가입 완료")
                .font(.pochakTitle02)
                .foregroundStyle(Color.pochakTextPrimary)
                .multilineTextAlignment(.center)

            Spacer().frame(height: 48)

            // -- Subscribe CTA with green gradient --
            Button(action: onSubscribe) {
                Text("대가족 무제한 시청권! 지금 구독하기")
                    .font(.pochakButton)
                    .fontWeight(.bold)
                    .foregroundStyle(Color.pochakTextOnPrimary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(LinearGradient.pochakCTAGradient)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .padding(.horizontal, 32)
            .accessibilityLabel("구독하기 버튼")

            Spacer().frame(height: 20)

            // -- Skip link --
            Button(action: onSkip) {
                Text("다음에 할게요.")
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextSecondary)
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 16)
            .accessibilityLabel("건너뛰기")

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }
}

// MARK: - Preview

#Preview {
    SignUpCompleteView()
        .preferredColorScheme(.dark)
}
