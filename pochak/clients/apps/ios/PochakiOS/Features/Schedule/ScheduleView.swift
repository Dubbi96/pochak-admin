// ScheduleView.swift
// Pochak OTT Platform - Schedule Screen
// Design ref: 일정 탭 - 이달의대회, 종목별 일정, 날짜별 경기 목록

import SwiftUI

struct ScheduleView: View {

    // MARK: - State

    @State private var selectedTab = 0
    @State private var selectedYear = 2026
    @State private var selectedMonth = 3
    @State private var showYearPicker = false
    @State private var showMonthPicker = false
    @State private var selectedSportTab = 0
    @State private var scrollOffset: CGFloat = 0
    @State private var showTopBar = true

    private let tabs = ["이달의대회", "#축구", "#야구", "#배구", "#핸드볼", "#농구", "#기타"]
    private let years = Array(2024...2027)
    private let months = Array(1...12)

    // Sample schedule data
    private let sampleScheduleGroups: [ScheduleDateGroup] = [
        ScheduleDateGroup(
            date: "03.15 (토)",
            dDay: "D-2",
            matches: [
                ScheduleMatch(id: "m1", time: "10:00", homeTeam: "동대문구 리틀야구", awayTeam: "군포시 리틀야구", homeScore: nil, awayScore: nil, competition: "6회 MLB컵 리틀야구 U10", status: .upcoming, round: "32강"),
                ScheduleMatch(id: "m2", time: "14:00", homeTeam: "성남FC U15", awayTeam: "수원삼성 U15", homeScore: nil, awayScore: nil, competition: "K리그 유스컵", status: .upcoming, round: "16강"),
            ]
        ),
        ScheduleDateGroup(
            date: "03.16 (일)",
            dDay: "D-3",
            matches: [
                ScheduleMatch(id: "m3", time: "LIVE", homeTeam: "서울 리틀야구", awayTeam: "부산 리틀야구", homeScore: "3", awayScore: "2", competition: "6회 MLB컵 리틀야구 U10", status: .live, round: "16강"),
                ScheduleMatch(id: "m4", time: "15:00", homeTeam: "대전 유소년", awayTeam: "광주 유소년", homeScore: "5", awayScore: "1", competition: "6회 MLB컵 리틀야구 U10", status: .finished, round: "8강"),
            ]
        ),
        ScheduleDateGroup(
            date: "03.20 (목)",
            dDay: "D-7",
            matches: [
                ScheduleMatch(id: "m5", time: "11:00", homeTeam: "인천 유소년 축구", awayTeam: "안양 유소년 축구", homeScore: nil, awayScore: nil, competition: "K리그 유스컵", status: .upcoming, round: "준결승"),
            ]
        ),
    ]

    // MARK: - Body

    var body: some View {
        ZStack(alignment: .top) {
            Color.pochakBg.ignoresSafeArea()
            RadialGradient.pochakAmbient.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    // TopBar spacer
                    Color.clear.frame(height: 56)

                    // Scrollable tabs
                    tabsBar
                        .padding(.top, 4)

                    // Year/Month selector
                    yearMonthSelector
                        .padding(.top, 16)
                        .padding(.horizontal, 20)

                    // Content based on selected tab
                    if selectedTab == 0 {
                        // 이달의대회
                        monthlyCompetitionsSection
                            .padding(.top, 20)
                    } else {
                        // Sport-specific schedule
                        sportScheduleSection
                            .padding(.top, 20)
                    }

                    Spacer().frame(height: 100)
                }
                .background(
                    GeometryReader { geo in
                        Color.clear.preference(
                            key: ScheduleScrollOffsetKey.self,
                            value: geo.frame(in: .named("scheduleScroll")).minY
                        )
                    }
                )
            }
            .coordinateSpace(name: "scheduleScroll")
            .onPreferenceChange(ScheduleScrollOffsetKey.self) { value in
                let delta = value - scrollOffset
                if delta < -4 { withAnimation(.easeOut(duration: 0.25)) { showTopBar = false } }
                if delta > 4 { withAnimation(.easeOut(duration: 0.25)) { showTopBar = true } }
                scrollOffset = value
            }

            // Floating TopBar
            scheduleTopBar
                .offset(y: showTopBar ? 0 : -100)
        }
    }

    // MARK: - TopBar

    private var scheduleTopBar: some View {
        HStack(spacing: 16) {
            Text("일정")
                .font(.pochakTitle03)
                .foregroundStyle(Color.pochakTextPrimary)
                .accessibilityAddTraits(.isHeader)

            Spacer()

            HStack(spacing: 18) {
                Button {
                    // search
                } label: {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(Color.pochakTextPrimary)
                }
                .accessibilityLabel("검색")

                Button {
                    // grid view
                } label: {
                    Image(systemName: "square.grid.2x2")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(Color.pochakTextPrimary)
                }
                .accessibilityLabel("카테고리")

                Button {
                    // menu
                } label: {
                    Image(systemName: "line.3.horizontal")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(Color.pochakTextPrimary)
                }
                .accessibilityLabel("메뉴")
            }
        }
        .padding(.horizontal, 20)
        .frame(height: 56)
        .background(
            Color.pochakBg.opacity(0.92)
                .background(.ultraThinMaterial)
        )
    }

    // MARK: - Scrollable Tabs

    private var tabsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(tabs.enumerated()), id: \.offset) { index, tab in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedTab = index
                        }
                    } label: {
                        Text(tab)
                            .font(.pochakBody02)
                            .foregroundStyle(selectedTab == index ? Color.pochakTextOnPrimary : Color.pochakTextSecondary)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(
                                selectedTab == index
                                    ? Color.pochakPrimary
                                    : Color.pochakSurface
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 20, style: .continuous)
                                    .stroke(
                                        selectedTab == index ? Color.clear : Color.pochakBorder.opacity(0.3),
                                        lineWidth: 1
                                    )
                            )
                    }
                    .accessibilityLabel(tab)
                    .accessibilityAddTraits(selectedTab == index ? .isSelected : [])
                }
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Year/Month Selector

    private var yearMonthSelector: some View {
        HStack(spacing: 12) {
            // Year dropdown
            Button {
                withAnimation(.spring(response: 0.3)) {
                    showYearPicker.toggle()
                    showMonthPicker = false
                }
            } label: {
                HStack(spacing: 4) {
                    Text("\(String(selectedYear))년")
                        .font(.pochakBody01)
                        .foregroundStyle(Color.pochakTextPrimary)
                    Image(systemName: "chevron.down")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color.pochakTextSecondary)
                        .rotationEffect(.degrees(showYearPicker ? 180 : 0))
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Color.pochakSurface)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .stroke(showYearPicker ? Color.pochakPrimary : Color.pochakBorder.opacity(0.3), lineWidth: 1)
                )
            }
            .overlay(alignment: .topLeading) {
                if showYearPicker {
                    yearPickerDropdown
                        .offset(y: 44)
                }
            }
            .zIndex(2)

            // Month dropdown
            Button {
                withAnimation(.spring(response: 0.3)) {
                    showMonthPicker.toggle()
                    showYearPicker = false
                }
            } label: {
                HStack(spacing: 4) {
                    Text("\(selectedMonth)월")
                        .font(.pochakBody01)
                        .foregroundStyle(Color.pochakTextPrimary)
                    Image(systemName: "chevron.down")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color.pochakTextSecondary)
                        .rotationEffect(.degrees(showMonthPicker ? 180 : 0))
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Color.pochakSurface)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .stroke(showMonthPicker ? Color.pochakPrimary : Color.pochakBorder.opacity(0.3), lineWidth: 1)
                )
            }
            .overlay(alignment: .topLeading) {
                if showMonthPicker {
                    monthPickerDropdown
                        .offset(y: 44)
                }
            }
            .zIndex(1)

            Spacer()

            // Calendar icon
            Button {
                // open calendar view
            } label: {
                Image(systemName: "calendar")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(Color.pochakPrimary)
                    .padding(8)
                    .background(Color.pochakPrimary.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .accessibilityLabel("달력 보기")
        }
    }

    private var yearPickerDropdown: some View {
        VStack(spacing: 0) {
            ForEach(years, id: \.self) { year in
                Button {
                    selectedYear = year
                    withAnimation { showYearPicker = false }
                } label: {
                    Text("\(String(year))년")
                        .font(.pochakBody02)
                        .foregroundStyle(selectedYear == year ? Color.pochakPrimary : Color.pochakTextPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                }
            }
        }
        .frame(width: 120)
        .background(Color.pochakSurface)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.3), radius: 8, y: 4)
    }

    private var monthPickerDropdown: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 0), count: 3), spacing: 0) {
            ForEach(months, id: \.self) { month in
                Button {
                    selectedMonth = month
                    withAnimation { showMonthPicker = false }
                } label: {
                    Text("\(month)월")
                        .font(.pochakBody02)
                        .foregroundStyle(selectedMonth == month ? Color.pochakPrimary : Color.pochakTextPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(selectedMonth == month ? Color.pochakPrimary.opacity(0.1) : Color.clear)
                }
            }
        }
        .frame(width: 200)
        .background(Color.pochakSurface)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.4), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.3), radius: 8, y: 4)
    }

    // MARK: - Monthly Competitions Section

    private var monthlyCompetitionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("이달의 대회")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            LazyVStack(spacing: 16) {
                ForEach(Array(SampleData.competitions.enumerated()), id: \.element.id) { index, competition in
                    CompetitionScheduleCard(competition: competition)
                        .staggeredAppear(index: index)
                        .padding(.horizontal, 20)
                }
            }

            // Separator
            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 1)
                .padding(.vertical, 8)
                .padding(.horizontal, 20)

            // Upcoming matches grouped by date
            Text("다가오는 경기")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            ForEach(sampleScheduleGroups, id: \.date) { group in
                ScheduleDateGroupView(group: group)
            }
        }
    }

    // MARK: - Sport Schedule Section

    private var sportScheduleSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Competition carousel for selected sport
            competitionCarousel

            // Separator
            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 1)
                .padding(.horizontal, 20)

            // Date-grouped match list
            ForEach(sampleScheduleGroups, id: \.date) { group in
                ScheduleDateGroupView(group: group)
            }
        }
    }

    private var competitionCarousel: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            LazyHStack(spacing: 12) {
                ForEach(Array(SampleData.competitions.enumerated()), id: \.element.id) { index, competition in
                    CompetitionCarouselCard(competition: competition)
                        .staggeredAppear(index: index)
                }
            }
            .padding(.horizontal, 20)
        }
    }
}

// MARK: - Schedule Data Models

struct ScheduleDateGroup: Hashable {
    let date: String
    let dDay: String
    let matches: [ScheduleMatch]
}

struct ScheduleMatch: Identifiable, Hashable {
    let id: String
    let time: String
    let homeTeam: String
    let awayTeam: String
    let homeScore: String?
    let awayScore: String?
    let competition: String
    let status: MatchStatus
    let round: String

    enum MatchStatus: Hashable {
        case upcoming, live, finished
    }
}

// MARK: - Competition Schedule Card

private struct CompetitionScheduleCard: View {
    let competition: Competition

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Banner area
            ZStack(alignment: .bottomLeading) {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Color.pochakSurface, Color.pochakSurfaceVar.opacity(0.6)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 120)
                    .overlay(
                        Image(systemName: "trophy.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.15))
                    )

                LinearGradient(
                    colors: [.clear, Color.pochakBgDeep.opacity(0.8)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }

            // Info area
            VStack(alignment: .leading, spacing: 6) {
                Text(competition.name)
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)

                Text(competition.dateRange)
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextSecondary)

                // Tags
                HStack(spacing: 6) {
                    TagChip(text: competition.category)
                    TagChip(text: "유소년")
                    TagChip(text: "전국대회")
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 12)
        }
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.2), lineWidth: 1)
        )
        .accessibilityLabel("\(competition.name), \(competition.dateRange)")
    }
}

// MARK: - Competition Carousel Card

private struct CompetitionCarouselCard: View {
    let competition: Competition

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Banner
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.pochakSurface, Color.pochakSurfaceVar.opacity(0.5)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 240, height: 100)
                .overlay(
                    Image(systemName: "trophy.fill")
                        .font(.title2)
                        .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                )

            Text(competition.name)
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(1)
                .frame(width: 240, alignment: .leading)

            Text(competition.dateRange)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
                .frame(width: 240, alignment: .leading)
        }
    }
}

// MARK: - Schedule Date Group View

private struct ScheduleDateGroupView: View {
    let group: ScheduleDateGroup

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Date header
            HStack(spacing: 8) {
                Text(group.date)
                    .font(.pochakBody01)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.pochakTextPrimary)

                Text(group.dDay)
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakPrimary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Color.pochakPrimary.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 4))

                Spacer()
            }
            .padding(.horizontal, 20)

            // Match rows
            ForEach(group.matches) { match in
                ScheduleMatchRow(match: match)
                    .padding(.horizontal, 20)
            }

            // Divider between groups
            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 1)
                .padding(.horizontal, 20)
                .padding(.top, 6)
        }
        .padding(.bottom, 8)
    }
}

// MARK: - Schedule Match Row

private struct ScheduleMatchRow: View {
    let match: ScheduleMatch

    var body: some View {
        HStack(spacing: 0) {
            // Left: time / status
            VStack(spacing: 2) {
                if match.status == .live {
                    Text("LIVE")
                        .font(.pochakBadge)
                        .foregroundStyle(Color.pochakLive)
                } else {
                    Text(match.time)
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextSecondary)
                }

                Text(match.round)
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
            }
            .frame(width: 50)

            // Center: teams and scores
            VStack(spacing: 6) {
                // Home team
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color.pochakSurface)
                        .frame(width: 28, height: 28)
                        .overlay(
                            Text(String(match.homeTeam.prefix(1)))
                                .font(.pochakBody04)
                                .foregroundStyle(Color.pochakTextSecondary)
                        )

                    Text(match.homeTeam)
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextPrimary)
                        .lineLimit(1)

                    Spacer()

                    if let score = match.homeScore {
                        Text(score)
                            .font(.pochakBody01)
                            .fontWeight(.bold)
                            .foregroundStyle(Color.pochakTextPrimary)
                            .frame(width: 28)
                    }
                }

                // Away team
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color.pochakSurface)
                        .frame(width: 28, height: 28)
                        .overlay(
                            Text(String(match.awayTeam.prefix(1)))
                                .font(.pochakBody04)
                                .foregroundStyle(Color.pochakTextSecondary)
                        )

                    Text(match.awayTeam)
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextPrimary)
                        .lineLimit(1)

                    Spacer()

                    if let score = match.awayScore {
                        Text(score)
                            .font(.pochakBody01)
                            .fontWeight(.bold)
                            .foregroundStyle(Color.pochakTextPrimary)
                            .frame(width: 28)
                    }
                }
            }
            .padding(.leading, 12)

            // Right: thumbnail / action
            ZStack {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 64, height: 48)

                switch match.status {
                case .live:
                    // Play icon with red border
                    Image(systemName: "play.fill")
                        .font(.caption)
                        .foregroundStyle(Color.pochakLive)
                case .finished:
                    // Play icon for replay
                    Image(systemName: "play.fill")
                        .font(.caption)
                        .foregroundStyle(Color.pochakTextSecondary)
                case .upcoming:
                    // Lock icon
                    Image(systemName: "lock.fill")
                        .font(.caption)
                        .foregroundStyle(Color.pochakTextTertiary)
                }
            }
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(
                        match.status == .live ? Color.pochakLive.opacity(0.6) : Color.pochakBorder.opacity(0.2),
                        lineWidth: match.status == .live ? 2 : 1
                    )
            )
            .padding(.leading, 8)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(
            match.status == .live
                ? Color.pochakLive.opacity(0.05)
                : Color.clear
        )
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(
                    match.status == .live ? Color.pochakLive.opacity(0.3) : Color.clear,
                    lineWidth: 1
                )
        )
        .accessibilityLabel("\(match.homeTeam) vs \(match.awayTeam), \(match.competition), \(match.round)")
    }
}

// MARK: - Tag Chip

private struct TagChip: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.pochakBody04)
            .foregroundStyle(Color.pochakTextSecondary)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Color.pochakSurface)
            .clipShape(RoundedRectangle(cornerRadius: 4))
    }
}

// MARK: - Scroll Offset Key

private struct ScheduleScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

// MARK: - Preview

#Preview {
    ScheduleView()
        .preferredColorScheme(.dark)
}
