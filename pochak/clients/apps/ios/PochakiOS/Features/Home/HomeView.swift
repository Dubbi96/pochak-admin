// HomeView.swift
// Pochak OTT Platform - Home Screen
// Design ref: TopBar (Pochak icon + TV dropdown) -> Banner carousel -> Live -> Clips -> Recent -> Teams -> Sections

import SwiftUI

struct HomeView: View {

    @State private var scrollOffset: CGFloat = 0
    @State private var showTopBar = true
    @State private var selectedBanner = 0
    @State private var selectedTVMode = "TV"
    @State private var showTVDropdown = false
    @State private var showGridMenu = false
    @State private var showSideMenu = false

    private let tvModes = ["TV", "LIVE", "VOD"]

    var body: some View {
        ZStack(alignment: .top) {
            // Background
            Color.pochakBg.ignoresSafeArea()
            RadialGradient.pochakAmbient.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {

                    // Spacer for TopBar
                    Color.clear.frame(height: 56)

                    // -- Hero Banner Carousel --
                    heroBannerSection

                    // -- Competition Info Bar --
                    competitionInfoBar
                        .padding(.top, 8)

                    Spacer().frame(height: 24)

                    // -- Official LIVE Section --
                    officialLiveSection

                    Spacer().frame(height: 28)

                    // -- Popular Clips Section --
                    popularClipsSection

                    Spacer().frame(height: 28)

                    // -- Recent Videos Section --
                    recentVideosSection

                    Spacer().frame(height: 28)

                    // -- Popular Teams/Clubs Section --
                    popularTeamsSection

                    Spacer().frame(height: 28)

                    // -- Team/Club LIVE Section --
                    teamLiveSection

                    Spacer().frame(height: 28)

                    // -- Team/Club Clips Section --
                    teamClipsSection

                    Spacer().frame(height: 28)

                    // -- Competition VOD Section --
                    competitionVODSection

                    Spacer().frame(height: 100) // GNB safe area
                }
                .background(
                    GeometryReader { geo in
                        Color.clear.preference(
                            key: ScrollOffsetKey.self,
                            value: geo.frame(in: .named("homeScroll")).minY
                        )
                    }
                )
            }
            .coordinateSpace(name: "homeScroll")
            .onPreferenceChange(ScrollOffsetKey.self) { value in
                let delta = value - scrollOffset
                if delta < -4 { withAnimation(.easeOut(duration: 0.25)) { showTopBar = false } }
                if delta > 4 { withAnimation(.easeOut(duration: 0.25)) { showTopBar = true } }
                scrollOffset = value
            }
            .refreshable {
                try? await Task.sleep(for: .seconds(1))
            }

            // -- Floating TopBar --
            topBar
                .offset(y: showTopBar ? 0 : -100)
        }
    }

    // MARK: - TopBar

    private var topBar: some View {
        HStack(spacing: 12) {
            // Pochak Logo Icon
            HStack(spacing: 6) {
                Image(systemName: "play.rectangle.fill")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(Color.pochakPrimary)

                // TV Dropdown
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        showTVDropdown.toggle()
                    }
                } label: {
                    HStack(spacing: 4) {
                        Text(selectedTVMode)
                            .font(.system(size: 18, weight: .heavy, design: .rounded))
                            .foregroundStyle(Color.pochakTextPrimary)
                        Image(systemName: "chevron.down")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(Color.pochakTextSecondary)
                            .rotationEffect(.degrees(showTVDropdown ? 180 : 0))
                    }
                }
                .accessibilityLabel("\(selectedTVMode) 모드 변경")
            }

            Spacer()

            // Action icons: search, grid, menu
            HStack(spacing: 18) {
                topBarIcon("magnifyingglass", label: "검색")
                topBarIcon("square.grid.2x2", label: "카테고리") {
                    showGridMenu.toggle()
                }
                topBarIcon("line.3.horizontal", label: "메뉴") {
                    showSideMenu.toggle()
                }
            }
        }
        .padding(.horizontal, 20)
        .frame(height: 56)
        .background(
            Color.pochakBg.opacity(0.92)
                .background(.ultraThinMaterial)
        )
        .overlay(alignment: .topLeading) {
            if showTVDropdown {
                tvDropdownMenu
                    .padding(.top, 56)
                    .padding(.leading, 20)
            }
        }
        .accessibilityElement(children: .contain)
    }

    private func topBarIcon(_ systemName: String, label: String, action: (() -> Void)? = nil) -> some View {
        Button {
            action?()
        } label: {
            Image(systemName: systemName)
                .font(.system(size: 20, weight: .medium))
                .foregroundStyle(Color.pochakTextPrimary)
        }
        .accessibilityLabel(label)
    }

    private var tvDropdownMenu: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(tvModes, id: \.self) { mode in
                Button {
                    selectedTVMode = mode
                    withAnimation(.spring(response: 0.3)) {
                        showTVDropdown = false
                    }
                } label: {
                    HStack {
                        Text(mode)
                            .font(.pochakBody01)
                            .foregroundStyle(selectedTVMode == mode ? Color.pochakPrimary : Color.pochakTextPrimary)
                        Spacer()
                        if selectedTVMode == mode {
                            Image(systemName: "checkmark")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(Color.pochakPrimary)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                }
            }
        }
        .frame(width: 140)
        .background(Color.pochakSurface)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.3), radius: 12, y: 4)
        .transition(.opacity.combined(with: .move(edge: .top)))
    }

    // MARK: - Hero Banner Carousel

    private var heroBannerSection: some View {
        ZStack(alignment: .bottomTrailing) {
            TabView(selection: $selectedBanner) {
                ForEach(Array(SampleData.banners.enumerated()), id: \.element.id) { index, banner in
                    ZStack(alignment: .bottomLeading) {
                        // Banner image placeholder
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.pochakSurface,
                                        Color.pochakSurfaceVar.opacity(0.5)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .overlay(
                                Image(systemName: "play.rectangle.fill")
                                    .font(.system(size: 48))
                                    .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                            )

                        // Gradient overlay
                        LinearGradient.pochakHeroOverlay

                        // Text overlay
                        VStack(alignment: .leading, spacing: 6) {
                            Text(banner.title)
                                .font(.pochakTitle04)
                                .foregroundStyle(Color.pochakTextPrimary)
                            Text(banner.subtitle)
                                .font(.pochakBody02)
                                .foregroundStyle(Color.pochakTextSecondary)
                        }
                        .padding(20)
                    }
                    .tag(index)
                    .accessibilityLabel("\(banner.title), \(banner.subtitle)")
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .frame(height: 220)

            // Custom page indicator "1/3"
            Text("\(selectedBanner + 1)/\(SampleData.banners.count)")
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(Color.black.opacity(0.6))
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                .padding(.trailing, 16)
                .padding(.bottom, 12)
        }
    }

    // MARK: - Competition Info Bar

    private var competitionInfoBar: some View {
        HStack(spacing: 10) {
            Circle()
                .fill(Color.pochakSurface)
                .frame(width: 28, height: 28)
                .overlay(
                    Image(systemName: "trophy.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.pochakClip)
                )

            VStack(alignment: .leading, spacing: 1) {
                Text(SampleData.competitions.first?.name ?? "")
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .lineLimit(1)
                Text(SampleData.competitions.first?.dateRange ?? "")
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.pochakTextTertiary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.pochakSurface.opacity(0.6))
        .padding(.horizontal, 16)
    }

    // MARK: - Official LIVE Section

    private var officialLiveSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "공식 라이브", badge: .live, action: "더보기")

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 12) {
                    ForEach(Array(SampleData.liveContents.enumerated()), id: \.element.id) { index, content in
                        OfficialLiveCard(content: content)
                            .staggeredAppear(index: index)
                    }

                    // Scheduled placeholder cards
                    ForEach(0..<3, id: \.self) { i in
                        ScheduledLiveCard(index: i)
                            .staggeredAppear(index: SampleData.liveContents.count + i)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Popular Clips Section

    private var popularClipsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "인기 클립", badge: .clip, action: "더보기")

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 12) {
                    ForEach(Array(SampleData.clips.enumerated()), id: \.element.id) { index, clip in
                        PopularClipCard(clip: clip)
                            .staggeredAppear(index: index)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Recent Videos Section

    private var recentVideosSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "최근 영상", action: "더보기")

            LazyVStack(spacing: 16) {
                ForEach(Array(SampleData.vodContents.prefix(4).enumerated()), id: \.element.id) { index, content in
                    RecentVideoRow(content: content)
                        .staggeredAppear(index: index)
                }
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Popular Teams/Clubs Section

    private var popularTeamsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "인기 팀/클럽", action: "더보기")

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 16) {
                    ForEach(Array(SampleData.teams.enumerated()), id: \.element.id) { index, team in
                        TeamCircleView(team: team)
                            .staggeredAppear(index: index)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Team/Club LIVE Section

    private var teamLiveSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "팀/클럽 라이브", badge: .live, action: "더보기")

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 12) {
                    ForEach(Array(SampleData.liveContents.enumerated()), id: \.element.id) { index, content in
                        TeamLiveCard(content: content)
                            .staggeredAppear(index: index)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Team/Club Clips Section

    private var teamClipsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "팀/클럽 클립", badge: .clip, action: "더보기")

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 12) {
                    ForEach(Array(SampleData.clips.prefix(4).enumerated()), id: \.element.id) { index, clip in
                        PopularClipCard(clip: clip)
                            .staggeredAppear(index: index)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Competition VOD Section

    private var competitionVODSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            ForEach(SampleData.competitions) { competition in
                VStack(alignment: .leading, spacing: 12) {
                    // Competition header
                    HStack(spacing: 10) {
                        Circle()
                            .fill(Color.pochakSurface)
                            .frame(width: 32, height: 32)
                            .overlay(
                                Image(systemName: "trophy.fill")
                                    .font(.system(size: 14))
                                    .foregroundStyle(Color.pochakClip)
                            )

                        VStack(alignment: .leading, spacing: 1) {
                            Text(competition.name)
                                .font(.pochakTitle04)
                                .foregroundStyle(Color.pochakTextPrimary)
                            Text(competition.dateRange)
                                .font(.pochakBody04)
                                .foregroundStyle(Color.pochakTextTertiary)
                        }

                        Spacer()

                        Button {
                            // navigate to competition
                        } label: {
                            HStack(spacing: 2) {
                                Text("더보기")
                                    .font(.pochakSectionLink)
                                Image(systemName: "chevron.right")
                                    .font(.caption2.weight(.semibold))
                            }
                            .foregroundStyle(Color.pochakTextSecondary)
                        }
                    }
                    .padding(.horizontal, 20)

                    // VOD list
                    ScrollView(.horizontal, showsIndicators: false) {
                        LazyHStack(spacing: 12) {
                            ForEach(Array(SampleData.vodContents.prefix(4).enumerated()), id: \.element.id) { index, content in
                                ContentCardView(content: content)
                                    .frame(width: 200)
                                    .staggeredAppear(index: index)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, badge: PochakBadgeType? = nil, action: String) -> some View {
        HStack(spacing: 8) {
            if let badge = badge {
                PochakBadge(type: badge)
            }

            Text(title)
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)

            Spacer()

            Button {
                // more
            } label: {
                HStack(spacing: 2) {
                    Text(action)
                        .font(.pochakSectionLink)
                    Image(systemName: "chevron.right")
                        .font(.caption2.weight(.semibold))
                }
                .foregroundStyle(Color.pochakTextSecondary)
            }
            .accessibilityLabel("\(title) \(action)")
        }
        .padding(.horizontal, 20)
    }
}

// MARK: - Scroll Offset Key

private struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

// MARK: - Official Live Card

private struct OfficialLiveCard: View {
    let content: VideoContent
    @State private var isPressed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topLeading) {
                // Thumbnail placeholder
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 260, height: 146)
                    .overlay(
                        Image(systemName: "video.fill")
                            .font(.title)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                    )

                // Live badge
                HStack(spacing: 6) {
                    PochakBadge(type: .live)

                    // Viewer count
                    HStack(spacing: 3) {
                        Circle()
                            .fill(Color.pochakLive)
                            .frame(width: 6, height: 6)
                        Text("\(content.viewCount)")
                            .font(.pochakBody04)
                            .foregroundStyle(.white)
                    }
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color.black.opacity(0.6))
                    .clipShape(RoundedRectangle(cornerRadius: 4))
                }
                .padding(8)

                // Live red border
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(Color.pochakLive.opacity(0.6), lineWidth: 2)
                    .frame(width: 260, height: 146)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(content.title)
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .lineLimit(2)
                    .frame(width: 260, alignment: .leading)

                Text(content.competition)
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
                    .lineLimit(1)
                    .frame(width: 260, alignment: .leading)

                // Tags
                HStack(spacing: 4) {
                    ForEach(content.tags.prefix(3), id: \.self) { tag in
                        Text(tag)
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakTextTertiary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.pochakSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                    }
                }
            }
        }
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
        .onTapGesture {
            withAnimation { isPressed = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation { isPressed = false }
            }
        }
        .accessibilityLabel("\(content.title), 라이브 중, 시청자 \(content.viewCount)명")
    }
}

// MARK: - Scheduled Live Card

private struct ScheduledLiveCard: View {
    let index: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 260, height: 146)
                    .overlay(
                        VStack(spacing: 6) {
                            Image(systemName: "calendar.badge.clock")
                                .font(.title2)
                                .foregroundStyle(Color.pochakTextTertiary.opacity(0.4))
                            Text("01/0\(index + 1) 예정")
                                .font(.pochakBody03)
                                .foregroundStyle(Color.pochakTextSecondary)
                        }
                    )

                PochakBadge(type: .scheduled)
                    .padding(8)
            }

            Text("예정된 경기 \(index + 1)")
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextPrimary)
                .frame(width: 260, alignment: .leading)

            Text("6회 MLB컵 리틀야구 U10")
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
                .frame(width: 260, alignment: .leading)
        }
        .accessibilityLabel("예정된 경기 \(index + 1)")
    }
}

// MARK: - Popular Clip Card

private struct PopularClipCard: View {
    let clip: ClipItem

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ZStack(alignment: .topTrailing) {
                // Square thumbnail
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 150, height: 150)
                    .overlay(
                        Image(systemName: "film.stack")
                            .font(.title2)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                    )

                // More button
                Button {
                    // more options
                } label: {
                    Image(systemName: "ellipsis")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color.pochakTextSecondary)
                        .padding(8)
                        .background(Color.black.opacity(0.4))
                        .clipShape(Circle())
                }
                .padding(6)
                .accessibilityLabel("클립 옵션")

                // Clip badge
                VStack {
                    Spacer()
                    HStack {
                        PochakBadge(type: .clip)
                        Spacer()
                    }
                    .padding(8)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            Text(clip.title)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)
                .frame(width: 150, alignment: .leading)

            HStack(spacing: 4) {
                Image(systemName: "eye.fill")
                    .font(.system(size: 9))
                Text("조회수 \(clip.viewCount)")
                    .font(.pochakBody04)
            }
            .foregroundStyle(Color.pochakTextTertiary)
        }
        .accessibilityLabel("\(clip.title), 조회수 \(clip.viewCount)")
    }
}

// MARK: - Recent Video Row

private struct RecentVideoRow: View {
    let content: VideoContent

    var body: some View {
        HStack(spacing: 12) {
            // Thumbnail
            ZStack(alignment: .bottomTrailing) {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 150, height: 84)
                    .overlay(
                        Image(systemName: "sportscourt.fill")
                            .font(.title3)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                    )

                // Duration badge
                Text(content.duration)
                    .font(.pochakBody04)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.black.opacity(0.7))
                    .clipShape(RoundedRectangle(cornerRadius: 4))
                    .padding(6)
            }
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(content.title)
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .lineLimit(2)

                Text(content.competition)
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
                    .lineLimit(1)

                // Tags
                HStack(spacing: 4) {
                    ForEach(content.tags.prefix(3), id: \.self) { tag in
                        Text(tag)
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakTextTertiary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.pochakSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                    }
                }

                HStack(spacing: 8) {
                    Text(content.date)
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextTertiary)
                    HStack(spacing: 3) {
                        Image(systemName: "eye.fill")
                            .font(.system(size: 9))
                        Text("\(content.viewCount)")
                            .font(.pochakBody04)
                    }
                    .foregroundStyle(Color.pochakTextTertiary)
                }
            }

            Spacer()
        }
        .accessibilityLabel("\(content.title), \(content.competition)")
    }
}

// MARK: - Team Circle View

private struct TeamCircleView: View {
    let team: Team

    var body: some View {
        VStack(spacing: 6) {
            Circle()
                .fill(Color.pochakSurface)
                .frame(width: 64, height: 64)
                .overlay(
                    Text(String(team.name.prefix(2)))
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextSecondary)
                )
                .overlay(
                    Circle()
                        .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
                )

            Text(team.name)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(1)
                .frame(width: 72)
                .multilineTextAlignment(.center)
        }
        .accessibilityLabel(team.name)
    }
}

// MARK: - Team Live Card

private struct TeamLiveCard: View {
    let content: VideoContent

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 220, height: 124)
                    .overlay(
                        Image(systemName: "video.fill")
                            .font(.title2)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                    )

                HStack(spacing: 4) {
                    PochakBadge(type: .live)
                    HStack(spacing: 3) {
                        Circle()
                            .fill(Color.pochakLive)
                            .frame(width: 5, height: 5)
                        Text("\(content.viewCount)")
                            .font(.pochakBody04)
                            .foregroundStyle(.white)
                    }
                    .padding(.horizontal, 5)
                    .padding(.vertical, 2)
                    .background(Color.black.opacity(0.5))
                    .clipShape(RoundedRectangle(cornerRadius: 4))
                }
                .padding(8)
            }
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(Color.pochakLive.opacity(0.4), lineWidth: 1.5)
            )

            Text(content.title)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)
                .frame(width: 220, alignment: .leading)

            Text(content.competition)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
                .lineLimit(1)
                .frame(width: 220, alignment: .leading)
        }
    }
}

// MARK: - Content Card (reusable)

struct ContentCardView: View {
    let content: VideoContent
    @State private var isPressed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ZStack(alignment: .topLeading) {
                // Thumbnail
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.pochakSurface)
                    .aspectRatio(16/9, contentMode: .fill)
                    .overlay(
                        Image(systemName: "sportscourt.fill")
                            .font(.title2)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                    )

                HStack(spacing: 4) {
                    PochakBadge(type: content.type == .live ? .live : content.type == .vod ? .vod : .scheduled)
                    if content.isFree {
                        PochakBadge(type: .free)
                    }
                }
                .padding(8)

                // Duration
                if content.type == .vod {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            Text(content.duration)
                                .font(.pochakBody04)
                                .foregroundStyle(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.black.opacity(0.7))
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                                .padding(8)
                        }
                    }
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            Text(content.title)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)

            Text(content.competition)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
                .lineLimit(1)

            // Tags
            HStack(spacing: 4) {
                ForEach(content.tags.prefix(3), id: \.self) { tag in
                    Text(tag)
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextTertiary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.pochakSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }
            }
        }
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
        .onTapGesture {
            withAnimation { isPressed = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation { isPressed = false }
            }
        }
        .accessibilityLabel("\(content.title), \(content.type.rawValue)")
    }
}

// MARK: - Preview

#Preview {
    HomeView()
        .preferredColorScheme(.dark)
}
