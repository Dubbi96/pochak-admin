// MyPageView.swift
// Pochak OTT Platform - My Page (개인 채널)
// Design ref: [포착3.0] Mobile 디자인 1.pdf - MyPage screens
// Tabs: 홈 | 시청이력 | 내클립 | 시청예약 | 즐겨찾기

import SwiftUI

struct MyPageView: View {

    @State private var selectedTab: MyTab = .home
    @State private var contentFilter: ContentFilter = .video

    private let user = SampleData.user

    enum MyTab: String, CaseIterable {
        case home = "홈"
        case history = "시청이력"
        case myClips = "내클립"
        case reservations = "시청예약"
        case favorites = "즐겨찾기"
    }

    enum ContentFilter: String, CaseIterable {
        case video = "영상"
        case clip = "클립"
    }

    var body: some View {
        ZStack {
            Color.pochakBg.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {

                    // -- Top Action Bar --
                    topActionBar

                    // -- Profile Header --
                    profileHeader
                        .padding(.horizontal, 20)
                        .padding(.top, 4)

                    // -- Tab Selector --
                    tabSelector
                        .padding(.top, 16)

                    // -- Tab Content --
                    tabContent
                        .padding(.top, 16)

                    Spacer().frame(height: 100)
                }
            }
        }
    }

    // MARK: - Top Action Bar

    private var topActionBar: some View {
        HStack(spacing: 16) {
            Spacer()

            Button {} label: {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .accessibilityLabel("검색")

            Button {} label: {
                Image(systemName: "rectangle.on.rectangle")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .accessibilityLabel("멀티뷰")

            Button {} label: {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Color.pochakTextPrimary)
            }
            .accessibilityLabel("메뉴")
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 8)
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        HStack(spacing: 14) {
            // Avatar
            ZStack {
                Circle()
                    .fill(Color.pochakSurface)
                    .frame(width: 56, height: 56)

                // Pochak logo placeholder
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
            .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(user.nickname)
                        .font(.pochakTitle04)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Button {} label: {
                        Image(systemName: "pencil")
                            .font(.caption)
                            .foregroundStyle(Color.pochakTextSecondary)
                    }
                    .accessibilityLabel("닉네임 수정")
                }

                Text(user.email)
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextSecondary)
            }

            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(user.nickname), \(user.email)")
    }

    // MARK: - Tab Selector

    private var tabSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 0) {
                ForEach(MyTab.allCases, id: \.self) { tab in
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
                        .padding(.horizontal, 16)
                    }
                    .accessibilityLabel(tab.rawValue)
                    .accessibilityAddTraits(selectedTab == tab ? .isSelected : [])
                }
            }
        }

        // Divider below tabs
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
        case .home:
            homeTabContent
        case .history:
            historyTabContent
        case .myClips:
            myClipsTabContent
        case .reservations:
            reservationsTabContent
        case .favorites:
            favoritesTabContent
        }
    }

    // MARK: - Home Tab

    private var homeTabContent: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Recent Videos
            sectionWithHorizontalScroll(title: "최근 본 영상") {
                ForEach(SampleData.vodContents.prefix(4)) { content in
                    recentVideoCard(content: content)
                }
            }

            // Recent Clips
            sectionWithHorizontalScroll(title: "최근 본 클립") {
                ForEach(SampleData.clips.prefix(4)) { clip in
                    clipCard(clip: clip)
                }
            }

            // My Clips
            sectionWithHorizontalScroll(title: "내 클립") {
                ForEach(SampleData.clips.prefix(3)) { clip in
                    clipCard(clip: clip)
                }
            }

            // Favorite Competitions
            sectionWithHorizontalScroll(title: "즐겨찾는 대회") {
                ForEach(SampleData.competitions) { comp in
                    competitionCard(competition: comp)
                }
            }

            // Favorite Teams
            sectionWithHorizontalScroll(title: "즐겨찾는 팀/클럽") {
                ForEach(SampleData.teams.prefix(4)) { team in
                    teamCard(team: team)
                }
            }
        }
        .padding(.horizontal, 20)
    }

    // MARK: - History Tab

    private var historyTabContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Filter chips
            HStack(spacing: 8) {
                ForEach(ContentFilter.allCases, id: \.self) { filter in
                    Button {
                        contentFilter = filter
                    } label: {
                        Text(filter.rawValue)
                            .font(.pochakTag)
                            .foregroundStyle(contentFilter == filter ? Color.pochakTextOnPrimary : Color.pochakTextSecondary)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 7)
                            .background(contentFilter == filter ? Color.pochakPrimary : Color.pochakSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .stroke(contentFilter == filter ? Color.clear : Color.pochakBorder.opacity(0.3), lineWidth: 1)
                            )
                    }
                    .accessibilityLabel("\(filter.rawValue) 필터")
                    .accessibilityAddTraits(contentFilter == filter ? .isSelected : [])
                }
                Spacer()
            }
            .padding(.horizontal, 20)

            if contentFilter == .video {
                // Video list
                LazyVStack(spacing: 12) {
                    ForEach(Array(SampleData.vodContents.enumerated()), id: \.element.id) { index, content in
                        videoListRow(content: content)
                            .staggeredAppear(index: index)
                    }
                }
                .padding(.horizontal, 20)
            } else {
                // Clip grid
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible())], spacing: 8) {
                    ForEach(Array(SampleData.clips.enumerated()), id: \.element.id) { index, clip in
                        clipGridCard(clip: clip)
                            .staggeredAppear(index: index)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - My Clips Tab

    private var myClipsTabContent: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible())], spacing: 16) {
            ForEach(Array(SampleData.clips.enumerated()), id: \.element.id) { index, clip in
                VStack(alignment: .leading, spacing: 6) {
                    clipGridCard(clip: clip)

                    Text("2026.01.01 클립")
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextTertiary)

                    Text("6회 MLB컵 리틀야구 U10 | 준결승")
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextTertiary)
                        .lineLimit(1)

                    Text("동대문구 리틀야구 vs 군포시 리...")
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextTertiary)
                        .lineLimit(1)
                }
                .staggeredAppear(index: index)
            }
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Reservations Tab

    private var reservationsTabContent: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Date groups
            dateGroup(date: "2026.01.01", dDay: "D-Day", contents: Array(SampleData.vodContents.prefix(3)))
            dateGroup(date: "2026.01.02", dDay: "D+1", contents: Array(SampleData.vodContents.prefix(3)))
            dateGroup(date: "2026.01.03", dDay: "D+2", contents: Array(SampleData.vodContents.prefix(3)))
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Favorites Tab

    private var favoritesTabContent: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Favorite competitions
            VStack(alignment: .leading, spacing: 12) {
                Text("대회")
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)

                ForEach(SampleData.competitions) { comp in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(Color.pochakSurface)
                            .frame(width: 44, height: 44)
                            .overlay(
                                Image(systemName: "trophy.fill")
                                    .foregroundStyle(Color.pochakTextTertiary.opacity(0.4))
                            )

                        VStack(alignment: .leading, spacing: 2) {
                            Text(comp.name)
                                .font(.pochakBody01)
                                .foregroundStyle(Color.pochakTextPrimary)
                            Text(comp.dateRange)
                                .font(.pochakBody03)
                                .foregroundStyle(Color.pochakTextTertiary)
                        }

                        Spacer()

                        Image(systemName: "star.fill")
                            .foregroundStyle(Color.pochakWarning)
                    }
                }
            }

            // Favorite teams
            VStack(alignment: .leading, spacing: 12) {
                Text("팀/클럽")
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)

                ForEach(SampleData.teams.prefix(3)) { team in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(Color.pochakSurface)
                            .frame(width: 40, height: 40)
                            .overlay(
                                Text(String(team.name.prefix(1)))
                                    .font(.pochakBody02)
                                    .foregroundStyle(Color.pochakTextSecondary)
                            )

                        VStack(alignment: .leading, spacing: 2) {
                            Text(team.name)
                                .font(.pochakBody01)
                                .foregroundStyle(Color.pochakTextPrimary)
                            Text("\(team.sport) | \(team.division)")
                                .font(.pochakBody04)
                                .foregroundStyle(Color.pochakTextTertiary)
                        }

                        Spacer()

                        Image(systemName: "star.fill")
                            .foregroundStyle(Color.pochakWarning)
                    }
                }
            }
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Reusable Sub-Components

    private func sectionWithHorizontalScroll<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(title)
                    .font(.pochakBody01)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakTextPrimary)

                Image(systemName: "chevron.right")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Color.pochakTextTertiary)

                Spacer()
            }

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 12) {
                    content()
                }
            }
        }
    }

    private func recentVideoCard(content: VideoContent) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 200, height: 112)
                    .overlay(
                        Image(systemName: "video.fill")
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                    )

                PochakBadge(type: .scheduled)
                    .padding(6)
            }
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            Text(content.title)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(1)
                .frame(width: 200, alignment: .leading)

            HStack(spacing: 4) {
                Image(systemName: "eye.fill").font(.system(size: 8))
                Text("6회 MLB컵 리틀야구 U10 | 준결승")
                    .lineLimit(1)
            }
            .font(.pochakBody04)
            .foregroundStyle(Color.pochakTextTertiary)
            .frame(width: 200, alignment: .leading)

            Text("\(content.tags.joined(separator: " | ")) | \(content.date)")
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
                .lineLimit(1)
                .frame(width: 200, alignment: .leading)
        }
    }

    private func clipCard(clip: ClipItem) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            ZStack(alignment: .topTrailing) {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 140, height: 140)
                    .overlay(
                        Image(systemName: "film.stack")
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                    )

                Button {} label: {
                    Image(systemName: "ellipsis")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color.pochakTextSecondary)
                        .padding(8)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            Text(clip.title)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)
                .frame(width: 140, alignment: .leading)

            Text("조회수 \(clip.viewCount)")
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
        }
    }

    private func competitionCard(competition: Competition) -> some View {
        VStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.pochakSurface)
                .frame(width: 180, height: 100)
                .overlay(
                    Image(systemName: "trophy.fill")
                        .font(.title2)
                        .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                )

            Text(competition.name)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(1)
                .frame(width: 180)

            Text(competition.dateRange)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
        }
    }

    private func teamCard(team: Team) -> some View {
        VStack(spacing: 6) {
            Circle()
                .fill(Color.pochakSurface)
                .frame(width: 56, height: 56)
                .overlay(
                    Text(String(team.name.prefix(1)))
                        .font(.pochakTitle04)
                        .foregroundStyle(Color.pochakTextSecondary)
                )

            Text(team.name)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(1)
                .frame(width: 80)

            Text("\(team.sport) | \(team.division)")
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
                .lineLimit(1)
                .frame(width: 80)
        }
    }

    private func videoListRow(content: VideoContent) -> some View {
        HStack(spacing: 12) {
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 130, height: 73)
                    .overlay(
                        Image(systemName: "video.fill")
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                    )

                PochakBadge(type: .scheduled)
                    .scaleEffect(0.85)
                    .padding(4)

                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Text(content.duration)
                            .font(.pochakBody04)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(Color.black.opacity(0.7))
                            .clipShape(RoundedRectangle(cornerRadius: 3))
                            .padding(4)
                    }
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            VStack(alignment: .leading, spacing: 3) {
                Text(content.title)
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .lineLimit(2)

                Text("야구")
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)

                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.pochakSurface)
                        .frame(width: 16, height: 16)
                    Text(content.competition)
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextTertiary)
                        .lineLimit(1)
                }

                Text("\(content.tags.joined(separator: " | ")) | \(content.date)")
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
                    .lineLimit(1)
            }

            Spacer()

            Button {} label: {
                Image(systemName: "ellipsis")
                    .foregroundStyle(Color.pochakTextSecondary)
            }
        }
    }

    private func clipGridCard(clip: ClipItem) -> some View {
        ZStack(alignment: .topTrailing) {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(Color.pochakSurface)
                .aspectRatio(1, contentMode: .fill)
                .overlay(
                    VStack {
                        Image(systemName: "film.stack")
                            .font(.title2)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))

                        Spacer()

                        VStack(alignment: .leading, spacing: 2) {
                            Text(clip.title)
                                .font(.pochakBody04)
                                .foregroundStyle(Color.pochakTextPrimary)
                                .lineLimit(2)
                            Text("조회수 \(clip.viewCount)")
                                .font(.pochakBody04)
                                .foregroundStyle(Color.pochakTextTertiary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(8)
                        .background(
                            LinearGradient(
                                colors: [.clear, Color.black.opacity(0.6)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                    }
                )
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            Button {} label: {
                Image(systemName: "ellipsis")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.white)
                    .padding(8)
            }
        }
    }

    private func dateGroup(date: String, dDay: String, contents: [VideoContent]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Text(date)
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)
                Text("| \(dDay)")
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextSecondary)
            }

            ForEach(contents) { content in
                videoListRow(content: content)
            }
        }
    }
}

// MARK: - Preview

#Preview {
    MyPageView()
        .preferredColorScheme(.dark)
}
