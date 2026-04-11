// MainTabView.swift
// Pochak OTT Platform - Bottom Tab Navigation (GNB)
// 5 tabs: 홈 | 일정 | 촬영예약 | 클립 | 마이

import SwiftUI

struct MainTabView: View {

    @State private var selectedTab: PochakTab = .home

    enum PochakTab: Int, CaseIterable {
        case home, schedule, filming, clips, myPage

        var label: String {
            switch self {
            case .home:     return "홈"
            case .schedule: return "일정"
            case .filming:  return "촬영예약"
            case .clips:    return "클립"
            case .myPage:   return "마이"
            }
        }

        var icon: String {
            switch self {
            case .home:     return "house"
            case .schedule: return "calendar"
            case .filming:  return "video.badge.plus"
            case .clips:    return "film.stack"
            case .myPage:   return "person.circle"
            }
        }

        var selectedIcon: String {
            switch self {
            case .home:     return "house.fill"
            case .schedule: return "calendar"
            case .filming:  return "video.badge.plus.fill"
            case .clips:    return "film.stack.fill"
            case .myPage:   return "person.circle.fill"
            }
        }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            // Content
            TabView(selection: $selectedTab) {
                HomeView()
                    .tag(PochakTab.home)

                ScheduleView()
                    .tag(PochakTab.schedule)

                FilmingPlaceholderView()
                    .tag(PochakTab.filming)

                ClipsView()
                    .tag(PochakTab.clips)

                MyPageView()
                    .tag(PochakTab.myPage)
            }

            // Custom Tab Bar
            customTabBar
        }
        .ignoresSafeArea(.keyboard)
    }

    // MARK: - Custom Tab Bar

    private var customTabBar: some View {
        VStack(spacing: 0) {
            // Top border line
            Rectangle()
                .fill(Color.pochakTabBorder)
                .frame(height: 0.5)

            HStack(spacing: 0) {
                ForEach(PochakTab.allCases, id: \.rawValue) { tab in
                    tabButton(for: tab)
                }
            }
            .padding(.top, 6)
            .padding(.bottom, 20)
            .background(Color.pochakTabBg)
        }
    }

    private func tabButton(for tab: PochakTab) -> some View {
        Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                selectedTab = tab
            }
        } label: {
            VStack(spacing: 3) {
                Image(systemName: selectedTab == tab ? tab.selectedIcon : tab.icon)
                    .font(.system(size: tab == .myPage ? 22 : 20, weight: .medium))
                    .foregroundStyle(selectedTab == tab ? Color.pochakPrimary : Color.pochakTabInactive)
                    .scaleEffect(selectedTab == tab ? 1.08 : 1.0)
                    .animation(.spring(response: 0.3, dampingFraction: 0.6), value: selectedTab)

                Text(tab.label)
                    .font(.pochakTab)
                    .foregroundStyle(selectedTab == tab ? Color.pochakPrimary : Color.pochakTabInactive)
            }
            .frame(maxWidth: .infinity)
        }
        .accessibilityLabel(tab.label)
        .accessibilityAddTraits(selectedTab == tab ? .isSelected : [])
    }
}

// MARK: - Placeholder Tabs

struct FilmingPlaceholderView: View {
    var body: some View {
        ZStack {
            Color.pochakBg.ignoresSafeArea()
            VStack(spacing: 12) {
                Image(systemName: "video.badge.plus")
                    .font(.system(size: 48))
                    .foregroundStyle(Color.pochakTextTertiary)
                Text("촬영예약")
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextSecondary)
            }
        }
    }
}

// MARK: - Preview

#Preview {
    MainTabView()
        .preferredColorScheme(.dark)
}
