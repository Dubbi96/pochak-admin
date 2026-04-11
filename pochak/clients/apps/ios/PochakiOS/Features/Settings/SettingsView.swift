// SettingsView.swift
// Pochak OTT Platform - Settings Screen (4 tabs)
// Design ref: [포착3.0] Mobile 디자인 1.pdf - Settings screens

import SwiftUI

struct SettingsView: View {

    var onBackClick: () -> Void = {}

    // Tab selection
    @State private var selectedTab: SettingsTab = .notification

    // Notification tab state
    @State private var notificationPill: NotificationPill = .service

    // Service notification toggles
    @State private var nightAlert = false
    @State private var reservationReminder = true
    @State private var clipComplete = true
    @State private var clipLike = true
    @State private var recommendedCompetition = true
    @State private var productNews = true
    @State private var newGift = true
    @State private var facilityNews = true
    @State private var joinedClubNews = true
    @State private var recommendedClubNews = false
    @State private var serviceOperation = true
    @State private var notices = true
    @State private var events = false

    // Marketing notification toggles
    @State private var smsReceive = false
    @State private var emailReceive = false
    @State private var pushReceive = false
    @State private var customizedAd = true

    // Favorites tab state
    @State private var favoritesPill: FavoritesPill = .teamClub
    @State private var teamBellStates: [String: Bool] = [:]
    @State private var compBellStates: [String: Bool] = [:]

    // Service default toggles
    @State private var mute = false
    @State private var preview = true
    @State private var autoPlay = true
    @State private var pipMode = false
    @State private var autoPlayStop = false
    @State private var wifiOnly = false
    @State private var clipPublic = true
    @State private var serviceProductNews = true
    @State private var serviceNewGift = true

    enum SettingsTab: String, CaseIterable {
        case notification = "알림설정"
        case favorites = "즐겨찾는 항목 알림"
        case serviceDefault = "서비스기본설정"
        case environment = "환경설정"
    }

    enum NotificationPill: String, CaseIterable {
        case service = "서비스 알림"
        case marketing = "마케팅, 광고 알림"
    }

    enum FavoritesPill: String, CaseIterable {
        case teamClub = "팀/클럽"
        case competition = "대회"
    }

    var body: some View {
        ZStack {
            Color.pochakBg.ignoresSafeArea()

            VStack(spacing: 0) {

                // -- Top Bar --
                topBar
                    .padding(.horizontal, 20)
                    .padding(.top, 8)

                // -- Tab Selector --
                tabSelector
                    .padding(.top, 8)

                // -- Tab Content --
                ScrollView(showsIndicators: false) {
                    tabContent
                        .padding(.top, 16)
                        .padding(.bottom, 100)
                }
            }
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            Button(action: onBackClick) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .accessibilityLabel("뒤로가기")

            Spacer()
        }
        .padding(.vertical, 8)
    }

    // MARK: - Tab Selector

    private var tabSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 20) {
                ForEach(SettingsTab.allCases, id: \.self) { tab in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedTab = tab
                        }
                    } label: {
                        VStack(spacing: 6) {
                            Text(tab.rawValue)
                                .font(.pochakBody02)
                                .fontWeight(selectedTab == tab ? .semibold : .regular)
                                .foregroundStyle(selectedTab == tab ? Color.pochakTextPrimary : Color.pochakTextTertiary)

                            Rectangle()
                                .fill(selectedTab == tab ? Color.pochakPrimary : Color.clear)
                                .frame(height: 2)
                        }
                    }
                    .accessibilityLabel(tab.rawValue)
                    .accessibilityAddTraits(selectedTab == tab ? .isSelected : [])
                }
            }
            .padding(.horizontal, 20)
        }
        .overlay(
            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5),
            alignment: .bottom
        )
    }

    // MARK: - Tab Content

    @ViewBuilder
    private var tabContent: some View {
        switch selectedTab {
        case .notification:
            notificationTabContent
        case .favorites:
            favoritesTabContent
        case .serviceDefault:
            serviceDefaultTabContent
        case .environment:
            environmentTabContent
        }
    }

    // MARK: - Notification Tab

    private var notificationTabContent: some View {
        VStack(spacing: 16) {

            // Toggle pills
            HStack(spacing: 8) {
                ForEach(NotificationPill.allCases, id: \.self) { pill in
                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            notificationPill = pill
                        }
                    } label: {
                        Text(pill.rawValue)
                            .font(.pochakTag)
                            .foregroundStyle(notificationPill == pill ? Color.pochakTextOnPrimary : Color.pochakTextSecondary)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(notificationPill == pill ? Color.pochakPrimary : Color.pochakSurface)
                            .clipShape(Capsule())
                            .overlay(
                                Capsule()
                                    .stroke(notificationPill == pill ? Color.clear : Color.pochakBorder.opacity(0.3), lineWidth: 1)
                            )
                    }
                    .accessibilityLabel(pill.rawValue)
                    .accessibilityAddTraits(notificationPill == pill ? .isSelected : [])
                }
                Spacer()
            }
            .padding(.horizontal, 20)

            if notificationPill == .service {
                serviceNotificationContent
            } else {
                marketingNotificationContent
            }
        }
    }

    private var serviceNotificationContent: some View {
        VStack(spacing: 0) {

            // Notification time section
            settingsSectionHeader("알림 시간대")
            settingsToggleRow(title: "야간 서비스 알림 (21시 ~ 08시)", isOn: $nightAlert)
            sectionDivider

            // Pochak TV
            settingsSectionHeader("포착TV")
            settingsToggleRow(title: "시청예약 경기 미리알림(10분전)", isOn: $reservationReminder)
            rowDivider
            settingsToggleRow(title: "클립 생성 완료", isOn: $clipComplete)
            rowDivider
            settingsToggleRow(title: "내 클립 '좋아요'", isOn: $clipLike)
            rowDivider
            settingsToggleRow(title: "추천 대회 소식", isOn: $recommendedCompetition)
            rowDivider
            settingsToggleRow(title: "이용 상품 소식", isOn: $productNews)
            rowDivider
            settingsToggleRow(title: "새 선물 도착", isOn: $newGift)
            sectionDivider

            // Pochak City
            settingsSectionHeader("포착 City")
            settingsToggleRow(title: "관심, 추천 시설 소식", isOn: $facilityNews)
            sectionDivider

            // Pochak Club
            settingsSectionHeader("포착Club")
            settingsToggleRow(title: "가입 클럽 소식", isOn: $joinedClubNews)
            rowDivider
            settingsToggleRow(title: "추천 클럽 소식", isOn: $recommendedClubNews)
            sectionDivider

            // Service notification
            settingsSectionHeader("서비스 알림")
            settingsToggleRow(title: "서비스 운영", isOn: $serviceOperation)
            rowDivider
            settingsToggleRow(title: "공지사항", isOn: $notices)
            rowDivider
            settingsToggleRow(title: "이벤트", isOn: $events)
        }
    }

    private var marketingNotificationContent: some View {
        VStack(spacing: 0) {

            // Marketing info receive
            VStack(alignment: .leading, spacing: 8) {
                Text("마케팅 정보 수신")
                    .font(.pochakBody01)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakTextPrimary)

                Button {} label: {
                    Text("약관 동의하기")
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakPrimary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
            .padding(.vertical, 16)

            sectionDivider

            settingsToggleRow(title: "SMS 수신", isOn: $smsReceive, tintColor: .pochakTextTertiary)
            rowDivider
            settingsToggleRow(title: "이메일 수신", isOn: $emailReceive, tintColor: .pochakTextTertiary)
            rowDivider
            settingsToggleRow(title: "앱 푸시 수신", isOn: $pushReceive, tintColor: .pochakTextTertiary)

            sectionDivider

            // Personalized ads
            VStack(alignment: .leading, spacing: 8) {
                Text("개인정보 수집 이용")
                    .font(.pochakBody01)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 4)

            settingsToggleRow(title: "맞춤형 광고 설정", isOn: $customizedAd)
        }
    }

    // MARK: - Favorites Tab

    private var favoritesTabContent: some View {
        VStack(spacing: 16) {

            // Toggle pills
            HStack(spacing: 8) {
                ForEach(FavoritesPill.allCases, id: \.self) { pill in
                    Button {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            favoritesPill = pill
                        }
                    } label: {
                        Text(pill.rawValue)
                            .font(.pochakTag)
                            .foregroundStyle(favoritesPill == pill ? Color.pochakTextOnPrimary : Color.pochakTextSecondary)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(favoritesPill == pill ? Color.pochakPrimary : Color.pochakSurface)
                            .clipShape(Capsule())
                            .overlay(
                                Capsule()
                                    .stroke(favoritesPill == pill ? Color.clear : Color.pochakBorder.opacity(0.3), lineWidth: 1)
                            )
                    }
                }
                Spacer()
            }
            .padding(.horizontal, 20)

            if favoritesPill == .teamClub {
                teamClubFavoritesList
            } else {
                competitionFavoritesList
            }
        }
    }

    private var teamClubFavoritesList: some View {
        LazyVStack(spacing: 0) {
            ForEach(SampleData.teams) { team in
                HStack(spacing: 12) {
                    // Bookmark icon
                    Image(systemName: "bookmark.fill")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.pochakPrimary)

                    // Team logo circle
                    Circle()
                        .fill(Color.pochakSurface)
                        .frame(width: 44, height: 44)
                        .overlay(
                            Text(String(team.name.prefix(1)))
                                .font(.pochakBody02)
                                .foregroundStyle(Color.pochakTextSecondary)
                        )

                    // Team info
                    VStack(alignment: .leading, spacing: 2) {
                        Text(team.name)
                            .font(.pochakBody01)
                            .foregroundStyle(Color.pochakTextPrimary)
                            .lineLimit(1)

                        Text("\(team.sport) | \(team.division)")
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextTertiary)
                    }

                    Spacer()

                    // Bell toggle
                    Button {
                        let current = teamBellStates[team.id] ?? true
                        teamBellStates[team.id] = !current
                    } label: {
                        Image(systemName: (teamBellStates[team.id] ?? true) ? "bell.fill" : "bell.slash")
                            .font(.system(size: 16))
                            .foregroundStyle((teamBellStates[team.id] ?? true) ? Color.pochakPrimary : Color.pochakTextTertiary)
                    }
                    .accessibilityLabel("알림 토글")
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)

                Rectangle()
                    .fill(Color.pochakDivider)
                    .frame(height: 0.5)
                    .padding(.leading, 20)
            }
        }
    }

    private var competitionFavoritesList: some View {
        LazyVStack(spacing: 0) {
            ForEach(SampleData.competitions) { comp in
                HStack(spacing: 12) {
                    // Bookmark
                    Image(systemName: "bookmark.fill")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.pochakPrimary)

                    // Competition thumbnail
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(Color.pochakSurface)
                        .frame(width: 56, height: 44)
                        .overlay(
                            Image(systemName: "trophy.fill")
                                .font(.caption)
                                .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                        )

                    // Competition info
                    VStack(alignment: .leading, spacing: 2) {
                        Text(comp.name)
                            .font(.pochakBody01)
                            .foregroundStyle(Color.pochakTextPrimary)
                            .lineLimit(1)

                        Text(comp.dateRange)
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakTextTertiary)

                        Text("\(comp.category) | 유료 | 해설")
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakTextTertiary)
                    }

                    Spacer()

                    // Bell toggle
                    Button {
                        let current = compBellStates[comp.id] ?? true
                        compBellStates[comp.id] = !current
                    } label: {
                        Image(systemName: (compBellStates[comp.id] ?? true) ? "bell.fill" : "bell.slash")
                            .font(.system(size: 16))
                            .foregroundStyle((compBellStates[comp.id] ?? true) ? Color.pochakPrimary : Color.pochakTextTertiary)
                    }
                    .accessibilityLabel("알림 토글")
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)

                Rectangle()
                    .fill(Color.pochakDivider)
                    .frame(height: 0.5)
                    .padding(.leading, 20)
            }
        }
    }

    // MARK: - Service Default Tab

    private var serviceDefaultTabContent: some View {
        VStack(spacing: 0) {
            settingsSectionHeader("콘텐츠 시청")
            settingsToggleRow(title: "음소거", isOn: $mute)
            rowDivider
            settingsToggleRow(title: "미리보기", isOn: $preview)
            rowDivider
            settingsToggleRow(title: "자동재생", isOn: $autoPlay)
            rowDivider
            settingsToggleRow(title: "PIP모드 활성", isOn: $pipMode)
            rowDivider
            settingsToggleRow(title: "자동재생 중단", isOn: $autoPlayStop)
            rowDivider
            settingsToggleRow(title: "Wi-Fi 환경에서만 재생", isOn: $wifiOnly)

            sectionDivider

            settingsSectionHeader("클립 공개 범위")
            settingsToggleRow(title: "전체공개", isOn: $clipPublic)

            sectionDivider

            settingsToggleRow(title: "이용 상품 소식", isOn: $serviceProductNews)
            rowDivider
            settingsToggleRow(title: "새 선물 도착", isOn: $serviceNewGift)
        }
    }

    // MARK: - Environment Tab

    private var environmentTabContent: some View {
        VStack(spacing: 0) {
            // Country
            Button {} label: {
                HStack {
                    Text("이용국가")
                        .font(.pochakBody01)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer()

                    HStack(spacing: 6) {
                        Text("대한민국")
                            .font(.pochakBody02)
                            .foregroundStyle(Color.pochakTextSecondary)
                        Image(systemName: "chevron.down")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(Color.pochakTextTertiary)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .contentShape(Rectangle())
            }

            rowDivider

            // Design
            Button {} label: {
                HStack {
                    Text("디자인")
                        .font(.pochakBody01)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer()

                    HStack(spacing: 6) {
                        Text("다크모드")
                            .font(.pochakBody02)
                            .foregroundStyle(Color.pochakTextSecondary)
                        Image(systemName: "chevron.down")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(Color.pochakTextTertiary)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .contentShape(Rectangle())
            }

            rowDivider

            // App version
            HStack {
                Text("앱버전")
                    .font(.pochakBody01)
                    .foregroundStyle(Color.pochakTextPrimary)

                Text("v3.0")
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextSecondary)

                Spacer()

                Button {} label: {
                    HStack(spacing: 4) {
                        Text("업데이트하기")
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakPrimary)

                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(Color.pochakPrimary)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
    }

    // MARK: - Reusable Setting Components

    private func settingsSectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.pochakBody02)
            .fontWeight(.semibold)
            .foregroundStyle(Color.pochakTextPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
            .padding(.top, 20)
            .padding(.bottom, 8)
    }

    private func settingsToggleRow(title: String, isOn: Binding<Bool>, tintColor: Color = .pochakPrimary) -> some View {
        Toggle(isOn: isOn) {
            Text(title)
                .font(.pochakBody01)
                .foregroundStyle(Color.pochakTextPrimary)
        }
        .tint(tintColor == .pochakPrimary ? Color.pochakPrimary : Color.pochakTextTertiary)
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
    }

    private var rowDivider: some View {
        Rectangle()
            .fill(Color.pochakDivider)
            .frame(height: 0.5)
            .padding(.leading, 20)
    }

    private var sectionDivider: some View {
        Rectangle()
            .fill(Color.pochakDivider)
            .frame(height: 0.5)
    }
}

// MARK: - Preview

#Preview {
    SettingsView()
        .preferredColorScheme(.dark)
}
