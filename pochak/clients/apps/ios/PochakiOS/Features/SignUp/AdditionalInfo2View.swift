// AdditionalInfo2View.swift
// Pochak OTT Platform - Additional Info Step 2: Interest Sports
// Design ref: [포착3.0] Mobile 디자인 - 관심종목 선택

import SwiftUI

private let presetSports = ["축구", "야구", "배구", "핸드볼", "농구", "기타"]
private let maxSports = 3

struct AdditionalInfo2View: View {

    var onBackClick: () -> Void = {}
    var onSkipClick: () -> Void = {}
    var onNextClick: ([String]) -> Void = { _ in }

    @State private var selectedSports: [String] = []
    @State private var customSport = ""

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

            VStack(alignment: .leading, spacing: 0) {
                Spacer().frame(height: 24)

                // -- Title --
                Text("관심종목 선택")
                    .font(.pochakTitle03)
                    .foregroundStyle(Color.pochakTextPrimary)

                Spacer().frame(height: 8)

                Text("최대 \(maxSports)개 선택 가능")
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextSecondary)

                Spacer().frame(height: 24)

                // -- Preset sport chips --
                FlowLayout(spacing: 8) {
                    ForEach(presetSports, id: \.self) { sport in
                        SportChip(
                            text: "#\(sport)",
                            isSelected: selectedSports.contains(sport),
                            isEnabled: selectedSports.contains(sport) || selectedSports.count < maxSports,
                            onTap: { togglePreset(sport) }
                        )
                    }
                }

                Spacer().frame(height: 24)

                // -- Custom sport input --
                HStack(spacing: 8) {
                    TextField("", text: $customSport, prompt: Text("종목 직접입력").foregroundStyle(Color.pochakTextTertiary))
                        .font(.pochakBody01)
                        .foregroundStyle(Color.pochakTextPrimary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .background(Color.pochakSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                        )

                    Button(action: {
                        addSport(customSport)
                        customSport = ""
                    }) {
                        Text("추가")
                            .font(.pochakButton)
                    }
                    .foregroundStyle(Color.pochakTextOnPrimary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(
                        customSport.trimmingCharacters(in: .whitespaces).isEmpty || selectedSports.count >= maxSports
                            ? Color.pochakSurfaceVar
                            : Color.pochakPrimary
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .disabled(customSport.trimmingCharacters(in: .whitespaces).isEmpty || selectedSports.count >= maxSports)
                }

                Spacer().frame(height: 20)

                // -- Selected sports list --
                ScrollView(showsIndicators: false) {
                    LazyVStack(spacing: 8) {
                        ForEach(selectedSports, id: \.self) { sport in
                            SelectedSportItem(
                                text: sport,
                                onRemove: { removeSport(sport) }
                            )
                        }
                    }
                }
            }
            .padding(.horizontal, 24)

            // -- Bottom Bar --
            AdditionalInfoBottomBar(
                stepLabel: "추가정보 2 / 3",
                buttonText: "다음",
                onButtonClick: { onNextClick(selectedSports) }
            )
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    // MARK: - Helpers

    private func addSport(_ sport: String) {
        let trimmed = sport.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty, !selectedSports.contains(trimmed), selectedSports.count < maxSports else { return }
        selectedSports.append(trimmed)
    }

    private func removeSport(_ sport: String) {
        selectedSports.removeAll { $0 == sport }
    }

    private func togglePreset(_ sport: String) {
        if selectedSports.contains(sport) {
            removeSport(sport)
        } else {
            addSport(sport)
        }
    }
}

// MARK: - SportChip

private struct SportChip: View {

    let text: String
    let isSelected: Bool
    let isEnabled: Bool
    let onTap: () -> Void

    private var borderColor: Color {
        if isSelected { return .pochakPrimary }
        if !isEnabled { return .pochakSurfaceVar }
        return Color.pochakBorder.opacity(0.4)
    }

    private var textColor: Color {
        if isSelected { return .pochakPrimary }
        if !isEnabled { return .pochakSurfaceVar }
        return .pochakTextPrimary
    }

    private var bgColor: Color {
        isSelected ? Color.pochakPrimary.opacity(0.1) : .clear
    }

    var body: some View {
        Button(action: onTap) {
            Text(text)
                .font(.pochakBody02)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundStyle(textColor)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(bgColor)
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(borderColor, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
    }
}

// MARK: - SelectedSportItem

private struct SelectedSportItem: View {

    let text: String
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 6) {
            Text("#")
                .font(.pochakBody02)
                .fontWeight(.bold)
                .foregroundStyle(Color.pochakPrimary)

            Text(text)
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextPrimary)

            Spacer()

            Button(action: onRemove) {
                Image(systemName: "xmark")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.pochakTextTertiary)
            }
            .frame(width: 24, height: 24)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 12)
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder, lineWidth: 1)
        )
    }
}

// MARK: - Preview

#Preview {
    AdditionalInfo2View()
        .preferredColorScheme(.dark)
}
