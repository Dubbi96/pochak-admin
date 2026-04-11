// SNSTypeSelectView.swift
// Pochak OTT Platform - SNS Type Selection Screen
// Design ref: [포착3.0] Mobile 디자인 - POCHAK 회원가입

import SwiftUI

enum AgeGroup {
    case under14, over14
}

struct SNSTypeSelectView: View {

    var snsType: String = "카카오"
    var onAgeGroupSelected: (AgeGroup) -> Void = { _ in }
    var onForeignerClick: () -> Void = {}

    @State private var selectedAge: AgeGroup? = nil

    var body: some View {
        VStack(spacing: 0) {
            Spacer().frame(height: 48)

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    Spacer().frame(height: 48)

                    // -- Title --
                    Text("POCHAK 회원가입")
                        .font(.pochakTitle02)
                        .foregroundStyle(Color.pochakTextPrimary)
                        .multilineTextAlignment(.center)

                    Spacer().frame(height: 16)

                    // -- SNS Badge --
                    Text("\(snsType) 회원가입")
                        .font(.pochakButton)
                        .foregroundStyle(Color.pochakTextOnPrimary)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 8)
                        .background(Color.pochakPrimary)
                        .clipShape(Capsule())

                    Spacer().frame(height: 48)

                    // -- Age selection cards --
                    HStack(spacing: 16) {
                        AgeSelectionCard(
                            title: "만 14세 미만",
                            isSelected: selectedAge == .under14,
                            onTap: {
                                selectedAge = .under14
                                onAgeGroupSelected(.under14)
                            }
                        )

                        AgeSelectionCard(
                            title: "만 14세 이상",
                            isSelected: selectedAge == .over14,
                            onTap: {
                                selectedAge = .over14
                                onAgeGroupSelected(.over14)
                            }
                        )
                    }
                    .padding(.horizontal, 24)
                }
            }

            Spacer()

            // -- Foreigner link --
            Button(action: onForeignerClick) {
                Text("해외에서 응원해요! Foreigner")
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextSecondary)
                    .underline()
            }
            .padding(.vertical, 16)

            Spacer().frame(height: 32)
        }
        .frame(maxWidth: .infinity)
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }
}

// MARK: - AgeSelectionCard

private struct AgeSelectionCard: View {

    let title: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            Text(title)
                .font(.pochakBody01)
                .fontWeight(.semibold)
                .foregroundStyle(isSelected ? Color.pochakPrimary : Color.pochakTextPrimary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)
                .background(isSelected ? Color.pochakSurfaceVar : Color.pochakBg)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(
                            isSelected ? Color.pochakPrimary : Color.pochakBorder.opacity(0.4),
                            lineWidth: isSelected ? 2 : 1
                        )
                )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(title) \(isSelected ? "선택됨" : "")")
    }
}

// MARK: - Preview

#Preview {
    SNSTypeSelectView(snsType: "카카오")
        .preferredColorScheme(.dark)
}
