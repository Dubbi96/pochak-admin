// AdditionalInfo1View.swift
// Pochak OTT Platform - Additional Info Step 1: Interest Areas
// Design ref: [포착3.0] Mobile 디자인 - 관심지역 선택

import SwiftUI

struct AdditionalInfo1View: View {

    var onBackClick: () -> Void = {}
    var onSkipClick: () -> Void = {}
    var onNextClick: ([String]) -> Void = { _ in }
    var onSearchAddress: (String, @escaping ([String]) -> Void) -> Void = { _, cb in cb([]) }

    @State private var searchQuery = ""
    @State private var searchResults: [String] = []
    @State private var showResults = false
    @State private var selectedLocations: [String] = []

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
                Text("관심지역 선택")
                    .font(.pochakTitle03)
                    .foregroundStyle(Color.pochakTextPrimary)

                Spacer().frame(height: 8)

                Text("설정한 지역의 대회, 팀 정보를 제공드려요.")
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextSecondary)

                Spacer().frame(height: 24)

                // -- Search bar --
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(Color.pochakTextTertiary)

                    TextField("", text: $searchQuery, prompt: Text("주소검색").foregroundStyle(Color.pochakTextTertiary))
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextPrimary)
                        .autocapitalization(.none)
                        .onChange(of: searchQuery) { newValue in
                            if newValue.count >= 2 {
                                onSearchAddress(newValue) { results in
                                    searchResults = results
                                    showResults = !results.isEmpty
                                }
                            } else {
                                showResults = false
                            }
                        }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
                )

                // -- Search results dropdown --
                if showResults {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(searchResults.prefix(5), id: \.self) { result in
                            Button(action: {
                                if !selectedLocations.contains(result) {
                                    selectedLocations.append(result)
                                }
                                searchQuery = ""
                                showResults = false
                            }) {
                                Text(result)
                                    .font(.pochakBody02)
                                    .foregroundStyle(Color.pochakTextPrimary)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 12)
                            }
                        }
                    }
                    .background(Color.pochakSurface)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .shadow(color: .black.opacity(0.3), radius: 4, y: 2)
                }

                Spacer().frame(height: 20)

                // -- Selected locations --
                ScrollView(showsIndicators: false) {
                    LazyVStack(spacing: 8) {
                        ForEach(selectedLocations, id: \.self) { location in
                            LocationChip(
                                text: location,
                                onRemove: {
                                    selectedLocations.removeAll { $0 == location }
                                }
                            )
                        }
                    }
                }
            }
            .padding(.horizontal, 24)

            // -- Bottom Bar --
            AdditionalInfoBottomBar(
                stepLabel: "추가정보 1 / 3",
                buttonText: "다음",
                onButtonClick: { onNextClick(selectedLocations) }
            )
        }
        .background(Color.pochakBg.ignoresSafeArea())
        .navigationBarHidden(true)
    }
}

// MARK: - LocationChip

private struct LocationChip: View {

    let text: String
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "mappin.circle.fill")
                .font(.system(size: 18))
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
    AdditionalInfo1View()
        .preferredColorScheme(.dark)
}
