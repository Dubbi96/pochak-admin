// MyMenuHubView.swift
// Pochak OTT Platform - My Menu Hub (hamburger menu)
// Design ref: [포착3.0] Mobile 디자인 1.pdf - MyMenuHub screen

import SwiftUI

struct MyMenuHubView: View {

    var onBackClick: () -> Void = {}
    var onNavigate: (String) -> Void = { _ in }
    var onLogout: () -> Void = {}

    private let user = SampleData.user

    var body: some View {
        ZStack {
            Color.pochakBg.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {

                    // -- Top Action Bar --
                    topActionBar
                        .padding(.horizontal, 20)
                        .padding(.top, 8)

                    // -- Profile Section --
                    profileSection
                        .padding(.horizontal, 20)
                        .padding(.top, 16)

                    // -- Subscription Banner --
                    subscriptionBanner
                        .padding(.horizontal, 20)
                        .padding(.top, 20)

                    // -- Wallet Grid --
                    walletGrid
                        .padding(.horizontal, 20)
                        .padding(.top, 16)

                    // -- Menu Groups --
                    VStack(spacing: 0) {
                        menuGroupSection(
                            header: "포착 TV",
                            items: [
                                MenuItem(icon: "creditcard.fill", title: "구독/이용권 구매", route: "store"),
                                MenuItem(icon: "clock.fill", title: "시청내역", route: "watch_history"),
                                MenuItem(icon: "film.stack", title: "내 클립", route: "my_clips"),
                                MenuItem(icon: "calendar.badge.clock", title: "시청예약", route: "watch_reservation"),
                                MenuItem(icon: "star.fill", title: "즐겨찾기", route: "favorites"),
                            ]
                        )

                        menuGroupSection(
                            header: "포착 Club",
                            items: [
                                MenuItem(icon: "person.3.fill", title: "가입한 클럽", route: "joined_clubs"),
                                MenuItem(icon: "heart.fill", title: "관심클럽", route: "interested_clubs"),
                                MenuItem(icon: "bubble.left.and.bubble.right.fill", title: "커뮤니티", route: "community"),
                            ]
                        )

                        menuGroupSection(
                            header: "포착 City",
                            items: [
                                MenuItem(icon: "trophy.fill", title: "대회소식", route: "competition_news"),
                                MenuItem(icon: "building.2.fill", title: "시설예약", route: "facility_reservation"),
                                MenuItem(icon: "mappin.and.ellipse", title: "자주가는 시설", route: "frequent_facilities"),
                            ]
                        )

                        menuGroupSection(
                            header: "서비스",
                            items: [
                                MenuItem(icon: "bell.fill", title: "알림내역", route: "notifications"),
                                MenuItem(icon: "gearshape.fill", title: "설정", route: "settings"),
                                MenuItem(icon: "doc.text.fill", title: "공지사항", route: "notices"),
                                MenuItem(icon: "questionmark.circle.fill", title: "고객센터", route: "support"),
                            ]
                        )
                    }
                    .padding(.top, 20)

                    // -- Logout Button --
                    logoutButton
                        .padding(.top, 32)
                        .padding(.bottom, 40)

                    Spacer().frame(height: 100)
                }
            }
        }
    }

    // MARK: - Top Action Bar

    private var topActionBar: some View {
        HStack {
            Button(action: onBackClick) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .accessibilityLabel("뒤로가기")

            Spacer()

            HStack(spacing: 16) {
                Button { onNavigate("notifications") } label: {
                    Image(systemName: "bell")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(Color.pochakTextPrimary)
                }
                .accessibilityLabel("알림")

                Button { onNavigate("settings") } label: {
                    Image(systemName: "gearshape")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(Color.pochakTextPrimary)
                }
                .accessibilityLabel("설정")
            }
        }
        .padding(.vertical, 8)
    }

    // MARK: - Profile Section

    private var profileSection: some View {
        Button { onNavigate("profile_edit") } label: {
            HStack(spacing: 14) {
                // Avatar
                ZStack {
                    Circle()
                        .fill(Color.pochakSurface)
                        .frame(width: 56, height: 56)

                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(Color.pochakPrimary.opacity(0.15))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Text("P")
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundStyle(Color.pochakPrimary)
                        )
                        .clipShape(Circle())
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(user.nickname)
                        .font(.pochakTitle04)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Text(user.email)
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Color.pochakTextTertiary)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(user.nickname), \(user.email), 프로필 편집")
        .accessibilityAddTraits(.isButton)
    }

    // MARK: - Subscription Banner

    private var subscriptionBanner: some View {
        Button { onNavigate("subscription_manage") } label: {
            HStack(spacing: 0) {
                // Green accent left border
                Rectangle()
                    .fill(Color.pochakPrimary)
                    .frame(width: 4)

                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("구독 관리")
                            .font(.pochakBody02)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.pochakTextPrimary)

                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(Color.pochakTextSecondary)

                        Spacer()
                    }

                    Text("다음결제일: 2026.01.01")
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextSecondary)

                    Text("대가족 무제한 시청권")
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakPrimary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }
            .background(Color.pochakCard)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
            )
        }
        .accessibilityLabel("구독 관리, 대가족 무제한 시청권, 다음결제일 2026년 1월 1일")
    }

    // MARK: - Wallet Grid

    private var walletGrid: some View {
        VStack(spacing: 8) {
            // Top row: 뽈/기프트뽈
            Button { onNavigate("ppol_manage") } label: {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 4) {
                        Text("뽈/기프트뽈 관리")
                            .font(.pochakBody03)
                            .foregroundStyle(Color.pochakTextSecondary)
                        Image(systemName: "chevron.right")
                            .font(.system(size: 8, weight: .semibold))
                            .foregroundStyle(Color.pochakTextTertiary)
                        Spacer()
                    }

                    HStack(spacing: 0) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("10,000")
                                .font(.pochakTitle04)
                                .foregroundStyle(Color.pochakTextPrimary)
                            Text("P")
                                .font(.pochakBody04)
                                .foregroundStyle(Color.pochakPrimary)
                        }

                        Spacer()

                        Rectangle()
                            .fill(Color.pochakDivider)
                            .frame(width: 1, height: 36)

                        Spacer()

                        VStack(alignment: .leading, spacing: 2) {
                            Text("1,000")
                                .font(.pochakTitle04)
                                .foregroundStyle(Color.pochakTextPrimary)
                            Text("P")
                                .font(.pochakBody04)
                                .foregroundStyle(Color.pochakClip)
                        }
                    }
                    .padding(.horizontal, 8)
                }
                .padding(14)
                .background(Color.pochakCard)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
                )
            }

            // Bottom row: 이용권 + 선물함
            HStack(spacing: 8) {
                Button { onNavigate("ticket_manage") } label: {
                    walletSmallCard(
                        title: "이용권 관리",
                        value: "10",
                        unit: "개"
                    )
                }

                Button { onNavigate("gift_box") } label: {
                    walletSmallCard(
                        title: "선물함",
                        value: "10",
                        unit: "개"
                    )
                }
            }
        }
    }

    private func walletSmallCard(title: String, value: String, unit: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 4) {
                Text(title)
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextSecondary)
                Image(systemName: "chevron.right")
                    .font(.system(size: 8, weight: .semibold))
                    .foregroundStyle(Color.pochakTextTertiary)
                Spacer()
            }

            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(value)
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)
                Text(unit)
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextSecondary)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
        )
    }

    // MARK: - Menu Groups

    private struct MenuItem {
        let icon: String
        let title: String
        let route: String
    }

    private func menuGroupSection(header: String, items: [MenuItem]) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Section header
            Text(header)
                .font(.pochakBody03)
                .fontWeight(.semibold)
                .foregroundStyle(Color.pochakTextTertiary)
                .padding(.horizontal, 20)
                .padding(.top, 24)
                .padding(.bottom, 8)

            // Menu items
            ForEach(items, id: \.route) { item in
                Button { onNavigate(item.route) } label: {
                    HStack(spacing: 14) {
                        Image(systemName: item.icon)
                            .font(.system(size: 16))
                            .foregroundStyle(Color.pochakTextSecondary)
                            .frame(width: 24, alignment: .center)

                        Text(item.title)
                            .font(.pochakBody01)
                            .foregroundStyle(Color.pochakTextPrimary)

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(Color.pochakTextTertiary)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 14)
                    .contentShape(Rectangle())
                }
                .accessibilityLabel(item.title)

                if item.route != items.last?.route {
                    Rectangle()
                        .fill(Color.pochakDivider)
                        .frame(height: 0.5)
                        .padding(.leading, 58)
                }
            }

            // Bottom divider after group
            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 0.5)
                .padding(.top, 4)
        }
    }

    // MARK: - Logout Button

    private var logoutButton: some View {
        Button(action: onLogout) {
            Text("로그아웃")
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextSecondary)
                .padding(.horizontal, 32)
                .padding(.vertical, 12)
                .background(Color.pochakSurface)
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
                )
        }
        .frame(maxWidth: .infinity)
        .accessibilityLabel("로그아웃")
    }
}

// MARK: - Preview

#Preview {
    MyMenuHubView()
        .preferredColorScheme(.dark)
}
