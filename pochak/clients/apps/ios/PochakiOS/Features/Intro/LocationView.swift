// LocationView.swift
// Pochak OTT Platform - Location Selection
// Mirrors Android LocationScreen.kt

import SwiftUI

// MARK: - Data

struct LocationItem: Identifiable, Equatable {
    let id: String
    let name: String
    let address: String
}

// MARK: - Screen

struct LocationView: View {

    var onBackClick: () -> Void
    var onLocationSelected: (_ item: LocationItem) -> Void
    var onUseCurrentLocation: () -> Void

    var locations: [LocationItem] = []
    var currentAreaLabel: String = ""
    var isLoading: Bool = false

    @State private var query = ""
    @State private var selectedId: String?

    private var displayedLocations: [LocationItem] {
        if query.trimmingCharacters(in: .whitespaces).isEmpty {
            return locations
        }
        return locations.filter {
            $0.name.localizedCaseInsensitiveContains(query) ||
            $0.address.localizedCaseInsensitiveContains(query)
        }
    }

    private var headerText: String {
        if !currentAreaLabel.isEmpty {
            return "현재(\(currentAreaLabel)) 지역"
        } else if !query.trimmingCharacters(in: .whitespaces).isEmpty {
            return "\"\(query)\" 검색 결과"
        } else {
            return "지역 목록"
        }
    }

    var body: some View {
        ZStack {
            Color.pochakBg.ignoresSafeArea()

            VStack(spacing: 0) {
                // Top bar
                topBar

                // Search bar
                searchBar

                Spacer().frame(height: 20)

                // Section header
                Text(headerText)
                    .font(.pochakBody02)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakTextSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 8)

                // Location list
                locationList

                // Bottom button
                bottomButton
            }
        }
        .accessibilityLabel("Location selection screen")
    }

    // MARK: - Sub-views

    private var topBar: some View {
        HStack(spacing: 12) {
            Button {
                onBackClick()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.title3.weight(.medium))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .accessibilityLabel("뒤로 가기")

            Text("지역 선택")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)

            Spacer()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }

    private var searchBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 16))
                .foregroundStyle(Color.pochakTextTertiary)

            TextField(
                "",
                text: $query,
                prompt: Text("찾으시는 지역이 없으신가요? 검색")
                    .foregroundStyle(Color.pochakTextTertiary)
            )
            .font(.pochakBody03)
            .foregroundStyle(Color.pochakTextPrimary)
            .autocorrectionDisabled()
            .accessibilityLabel("지역 검색")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.pochakSurface)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }

    @ViewBuilder
    private var locationList: some View {
        if isLoading {
            Spacer()
            ProgressView()
                .tint(Color.pochakPrimary)
                .scaleEffect(1.2)
            Spacer()
        } else if displayedLocations.isEmpty {
            Spacer()
            emptyState
            Spacer()
        } else {
            ScrollView(showsIndicators: false) {
                LazyVStack(spacing: 8) {
                    ForEach(displayedLocations) { location in
                        locationRow(item: location)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 80)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "mappin.and.ellipse")
                .font(.system(size: 48))
                .foregroundStyle(Color.pochakTextTertiary)

            Text("검색 결과가 없습니다")
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextTertiary)

            Text("현재 위치로 찾기를 사용해보세요")
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextTertiary)
        }
    }

    private func locationRow(item: LocationItem) -> some View {
        let isSelected = item.id == selectedId

        return Button {
            selectedId = item.id
            onLocationSelected(item)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "mappin.circle.fill")
                    .font(.system(size: 20))
                    .foregroundStyle(isSelected ? Color.pochakPrimary : Color.pochakTextTertiary)

                VStack(alignment: .leading, spacing: 2) {
                    Text(item.name)
                        .font(.pochakBody02)
                        .fontWeight(.medium)
                        .foregroundStyle(isSelected ? Color.pochakPrimary : Color.pochakTextPrimary)

                    if !item.address.isEmpty {
                        Text(item.address)
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakTextSecondary)
                    }
                }

                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(isSelected ? Color.pochakSurfaceVar : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(isSelected ? Color.pochakPrimary : Color.pochakBorder.opacity(0.4), lineWidth: 1)
            )
        }
        .accessibilityLabel("\(item.name), \(item.address)")
    }

    private var bottomButton: some View {
        VStack {
            Button {
                onUseCurrentLocation()
            } label: {
                Text("현재 위치로 찾기")
            }
            .buttonStyle(PochakPrimaryButtonStyle())
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
        .background(Color.pochakBg)
    }
}

// MARK: - Preview

#Preview("With Locations") {
    LocationView(
        onBackClick: {},
        onLocationSelected: { _ in },
        onUseCurrentLocation: {},
        locations: [
            LocationItem(id: "1", name: "서울특별시", address: "대한민국 서울"),
            LocationItem(id: "2", name: "서울 강남구", address: "서울특별시 강남구"),
            LocationItem(id: "3", name: "서울 송파구", address: "서울특별시 송파구"),
            LocationItem(id: "4", name: "서울 마포구", address: "서울특별시 마포구"),
            LocationItem(id: "5", name: "서울 영등포구", address: "서울특별시 영등포구"),
        ],
        currentAreaLabel: "서울"
    )
    .preferredColorScheme(.dark)
}

#Preview("Empty") {
    LocationView(
        onBackClick: {},
        onLocationSelected: { _ in },
        onUseCurrentLocation: {}
    )
    .preferredColorScheme(.dark)
}
