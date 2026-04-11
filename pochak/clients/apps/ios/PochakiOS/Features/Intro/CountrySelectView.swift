// CountrySelectView.swift
// Pochak OTT Platform - Country / Language Selection
// Mirrors Android CountrySelectScreen.kt

import SwiftUI

private let countries = [
    "대한민국",
    "United States",
    "日本",
    "中国",
]

struct CountrySelectView: View {

    var onStart: (_ country: String) -> Void
    var onLoginClick: () -> Void

    @State private var selectedCountry = countries[0]
    @State private var isDropdownExpanded = false
    @State private var appeared = false

    var body: some View {
        ZStack {
            // Background
            Color.pochakBgDeep.ignoresSafeArea()
            RadialGradient.pochakLoginGlow.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo
                logoSection
                    .opacity(appeared ? 1 : 0)
                    .scaleEffect(appeared ? 1.0 : 0.85)

                Spacer().frame(height: 40)

                // Description
                descriptionSection
                    .opacity(appeared ? 1 : 0)

                Spacer().frame(height: 32)

                // Country Dropdown
                countryDropdown
                    .opacity(appeared ? 1 : 0)

                Spacer()

                // Bottom CTA
                bottomSection
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)

                Spacer().frame(height: 24)
            }
            .padding(.horizontal, 24)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.7)) {
                appeared = true
            }
        }
        .accessibilityLabel("Country selection screen")
    }

    // MARK: - Sub-views

    private var logoSection: some View {
        Text("POCHAK")
            .font(.pochakLogo)
            .foregroundStyle(LinearGradient.pochakLogoGradient)
            .accessibilityAddTraits(.isHeader)
    }

    private var descriptionSection: some View {
        VStack(spacing: 4) {
            Text("회원님의 서비스 국가를 선택해주세요!")
                .font(.pochakBody01)
                .fontWeight(.medium)
                .foregroundStyle(Color.pochakTextPrimary)
                .multilineTextAlignment(.center)

            Text("(언어 설정에 활용돼요)")
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextSecondary)
                .multilineTextAlignment(.center)
        }
    }

    private var countryDropdown: some View {
        VStack(spacing: 0) {
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isDropdownExpanded.toggle()
                }
            } label: {
                HStack {
                    Text(selectedCountry)
                        .font(.pochakBody01)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer()

                    Image(systemName: isDropdownExpanded ? "chevron.up" : "chevron.down")
                        .font(.body)
                        .foregroundStyle(Color.pochakTextSecondary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
                .background(Color.pochakSurface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                )
            }
            .accessibilityLabel("국가 선택: \(selectedCountry)")

            if isDropdownExpanded {
                VStack(spacing: 0) {
                    ForEach(countries, id: \.self) { country in
                        Button {
                            selectedCountry = country
                            withAnimation(.easeInOut(duration: 0.2)) {
                                isDropdownExpanded = false
                            }
                        } label: {
                            HStack {
                                Text(country)
                                    .font(.pochakBody02)
                                    .foregroundStyle(
                                        country == selectedCountry
                                            ? Color.pochakPrimary
                                            : Color.pochakTextPrimary
                                    )

                                Spacer()

                                if country == selectedCountry {
                                    Image(systemName: "checkmark")
                                        .font(.caption)
                                        .foregroundStyle(Color.pochakPrimary)
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                        }

                        if country != countries.last {
                            Divider()
                                .background(Color.pochakBorder.opacity(0.3))
                                .padding(.horizontal, 16)
                        }
                    }
                }
                .background(Color.pochakSurface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                )
                .padding(.top, 4)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
    }

    private var bottomSection: some View {
        VStack(spacing: 16) {
            Button {
                onStart(selectedCountry)
            } label: {
                Text("시작하기")
            }
            .buttonStyle(PochakPrimaryButtonStyle())
            .accessibilityLabel("시작하기 버튼")

            Button {
                onLoginClick()
            } label: {
                Text("로그인하기")
                    .font(.pochakBody02)
                    .fontWeight(.medium)
                    .foregroundStyle(Color.pochakTextSecondary)
            }
            .padding(.vertical, 8)
            .accessibilityLabel("로그인 페이지로 이동")
        }
    }
}

// MARK: - Preview

#Preview {
    CountrySelectView(
        onStart: { _ in },
        onLoginClick: {}
    )
    .preferredColorScheme(.dark)
}
