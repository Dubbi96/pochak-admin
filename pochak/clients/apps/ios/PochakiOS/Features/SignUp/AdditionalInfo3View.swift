// AdditionalInfo3View.swift
// Pochak OTT Platform - Additional Info Step 3: Service Motivation
// Design ref: [포착3.0] Mobile 디자인 - 서비스 이용 계기

import SwiftUI

private struct MotivationOption: Identifiable {
    let id: String
    let text: String
}

private let motivationOptions = [
    MotivationOption(id: "watch_my_game", text: "내 경기영상을 보고 싶어요 !"),
    MotivationOption(id: "watch_with_family", text: "자녀와 함께 경기 영상을 시청하고 싶어요 !"),
    MotivationOption(id: "manage_team", text: "나만의 팀을 만들고 운영하고 싶어요 !"),
]

struct AdditionalInfo3View: View {

    var onBackClick: () -> Void = {}
    var onSkipClick: () -> Void = {}
    var onCompleteClick: ([String]) -> Void = { _ in }

    @State private var selectedMotivations: Set<String> = []

    var body: some View {
        VStack(spacing: 0) {
            // -- Top Bar --
            signUpTopBar(onBackClick: onBackClick) {
                Button(action: onSkipClick) {
                    Text("건너뛰기")
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextSecondary)
                }
                .padding(.trailing, 8)
            }

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 24)

                    // -- Title --
                    Text("서비스 이용 계기")
                        .font(.pochakTitle03)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer().frame(height: 32)

                    // -- Motivation options --
                    VStack(spacing: 12) {
                        ForEach(motivationOptions) { option in
                            MotivationCard(
                                text: option.text,
                                isSelected: selectedMotivations.contains(option.id),
                                onTap: { toggleMotivation(option.id) }
                            )
                        }
                    }
                }
                .padding(.horizontal, 24)
            }

            // -- Bottom Bar --
            AdditionalInfoBottomBar(
                stepLabel: "추가정보 3 / 3",
                buttonText: "가입완료",
                onButtonClick: { onCompleteClick(Array(selectedMotivations)) }
            )
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    private func toggleMotivation(_ key: String) {
        if selectedMotivations.contains(key) {
            selectedMotivations.remove(key)
        } else {
            selectedMotivations.insert(key)
        }
    }
}

// MARK: - MotivationCard

private struct MotivationCard: View {

    let text: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                Text(text)
                    .font(.pochakBody01)
                    .fontWeight(isSelected ? .semibold : .regular)
                    .foregroundStyle(isSelected ? Color.pochakPrimary : Color.pochakTextPrimary)
                    .multilineTextAlignment(.leading)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Color.pochakPrimary)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 18)
            .background(isSelected ? Color.pochakPrimary.opacity(0.08) : .clear)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(
                        isSelected ? Color.pochakPrimary : Color.pochakBorder.opacity(0.4),
                        lineWidth: isSelected ? 1.5 : 1
                    )
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(text) \(isSelected ? "선택됨" : "")")
    }
}

// MARK: - Preview

#Preview {
    AdditionalInfo3View()
        .preferredColorScheme(.dark)
}
