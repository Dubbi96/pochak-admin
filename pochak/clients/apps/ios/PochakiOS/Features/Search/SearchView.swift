// SearchView.swift
// Pochak OTT Platform - Search Screen
// Design ref: Search bar + category tabs + sectioned results (teams/clubs/live/competitions/videos/clips)

import SwiftUI

struct SearchView: View {

    // MARK: - State

    @State private var searchText = ""
    @State private var isSearching = false
    @State private var selectedTab = 0
    @FocusState private var isTextFieldFocused: Bool

    private let tabs = ["전체", "팀", "클럽", "라이브", "대회", "영상", "클립"]
    private let popularTerms = ["MLB컵", "리틀야구", "축구 U12", "유소년 농구", "배구", "마라톤", "유도", "핸드볼"]
    private let recentSearches = ["동대문구 리틀야구", "성남FC U15", "K리그 유스컵"]

    // Sample club data
    private let sampleClubs: [ClubResult] = [
        ClubResult(id: "cl1", name: "동대문 스포츠클럽", sport: "종합", memberCount: 128),
        ClubResult(id: "cl2", name: "성남 유소년 축구", sport: "축구", memberCount: 64),
        ClubResult(id: "cl3", name: "부산 리틀야구 클럽", sport: "야구", memberCount: 45),
    ]

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                Color.pochakBg.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Search bar
                    searchBar
                        .padding(.horizontal, 20)
                        .padding(.top, 12)

                    if !searchText.isEmpty {
                        // Category tabs
                        categoryTabs
                            .padding(.top, 12)

                        // Results
                        ScrollView(showsIndicators: false) {
                            searchResultsContent
                                .padding(.top, 16)
                                .padding(.bottom, 100)
                        }
                    } else {
                        // Default state: recent + popular + trending
                        ScrollView(showsIndicators: false) {
                            VStack(alignment: .leading, spacing: 24) {
                                if !recentSearches.isEmpty {
                                    recentSection
                                }
                                popularSection
                                trendingSection
                                Spacer().frame(height: 100)
                            }
                            .padding(.horizontal, 20)
                            .padding(.top, 20)
                        }
                    }
                }
            }
            .navigationBarHidden(true)
        }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(isTextFieldFocused ? Color.pochakPrimary : Color.pochakTextTertiary)

                TextField("", text: $searchText, prompt: Text("대회, 팀, 선수 검색").foregroundStyle(Color.pochakTextTertiary))
                    .font(.pochakBody01)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .focused($isTextFieldFocused)
                    .submitLabel(.search)
                    .accessibilityLabel("검색어 입력")
                    .accessibilityHint("대회, 팀, 선수를 검색하세요")

                if !searchText.isEmpty {
                    Button {
                        searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Color.pochakTextTertiary)
                    }
                    .accessibilityLabel("검색어 지우기")
                }

                // Mic icon
                Button {
                    // voice search
                } label: {
                    Image(systemName: "mic.fill")
                        .foregroundStyle(Color.pochakTextTertiary)
                }
                .accessibilityLabel("음성 검색")
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(Color.pochakSurface)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(
                        isTextFieldFocused ? Color.pochakPrimary : Color.pochakBorder.opacity(0.3),
                        lineWidth: isTextFieldFocused ? 1.5 : 1
                    )
            )
            .shadow(
                color: isTextFieldFocused ? Color.pochakPrimary.opacity(0.1) : .clear,
                radius: isTextFieldFocused ? 6 : 0
            )

            if isTextFieldFocused {
                Button("취소") {
                    searchText = ""
                    isTextFieldFocused = false
                }
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakPrimary)
                .transition(.move(edge: .trailing).combined(with: .opacity))
                .animation(.easeOut(duration: 0.2), value: isTextFieldFocused)
            }
        }
    }

    // MARK: - Category Tabs

    private var categoryTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(Array(tabs.enumerated()), id: \.offset) { index, tab in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedTab = index
                        }
                    } label: {
                        Text(tab)
                            .font(.pochakBody03)
                            .foregroundStyle(
                                selectedTab == index
                                    ? Color.pochakTextOnPrimary
                                    : Color.pochakTextSecondary
                            )
                            .padding(.horizontal, 14)
                            .padding(.vertical, 7)
                            .background(
                                selectedTab == index
                                    ? Color.pochakPrimary
                                    : Color.pochakSurface
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .stroke(
                                        selectedTab == index
                                            ? Color.clear
                                            : Color.pochakBorder.opacity(0.3),
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

    // MARK: - Search Results Content

    @ViewBuilder
    private var searchResultsContent: some View {
        switch selectedTab {
        case 0:
            allResultsView
        case 1:
            teamsResultsView
        case 2:
            clubsResultsView
        case 3:
            liveResultsView
        case 4:
            competitionsResultsView
        case 5:
            videosResultsView
        case 6:
            clipsResultsView
        default:
            allResultsView
        }
    }

    // MARK: - All Results

    private var allResultsView: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Teams
            if !SampleData.teams.isEmpty {
                resultSection(title: "팀", count: SampleData.teams.count) {
                    teamsHorizontalScroll
                }
            }

            // Clubs
            if !sampleClubs.isEmpty {
                resultSection(title: "클럽", count: sampleClubs.count) {
                    clubsHorizontalScroll
                }
            }

            // Live
            if !SampleData.liveContents.isEmpty {
                resultSection(title: "라이브", count: SampleData.liveContents.count) {
                    liveCardsScroll
                }
            }

            // Competitions
            resultSection(title: "대회", count: SampleData.competitions.count) {
                competitionBanners
            }

            // Videos
            resultSection(title: "영상", count: SampleData.vodContents.count) {
                videosList
            }

            // Clips
            resultSection(title: "클립", count: SampleData.clips.count) {
                clipsGrid
            }
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Teams Results

    private var teamsResultsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("팀 검색 결과 (\(SampleData.teams.count))")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            // Grid of team circles
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: 4), spacing: 20) {
                ForEach(Array(SampleData.teams.enumerated()), id: \.element.id) { index, team in
                    TeamSearchCircle(team: team)
                        .staggeredAppear(index: index)
                }
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Clubs Results

    private var clubsResultsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("클럽 검색 결과 (\(sampleClubs.count))")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible())], spacing: 12) {
                ForEach(Array(sampleClubs.enumerated()), id: \.element.id) { index, club in
                    ClubSearchCard(club: club)
                        .staggeredAppear(index: index)
                }
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Live Results

    private var liveResultsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("라이브 (\(SampleData.liveContents.count))")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            LazyVStack(spacing: 12) {
                ForEach(Array(SampleData.liveContents.enumerated()), id: \.element.id) { index, content in
                    LiveSearchCard(content: content)
                        .staggeredAppear(index: index)
                        .padding(.horizontal, 20)
                }
            }
        }
    }

    // MARK: - Competitions Results

    private var competitionsResultsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("대회 (\(SampleData.competitions.count))")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            LazyVStack(spacing: 12) {
                ForEach(Array(SampleData.competitions.enumerated()), id: \.element.id) { index, comp in
                    CompetitionSearchBanner(competition: comp)
                        .staggeredAppear(index: index)
                        .padding(.horizontal, 20)
                }
            }
        }
    }

    // MARK: - Videos Results

    private var videosResultsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("영상 (\(SampleData.vodContents.count))")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            LazyVStack(spacing: 12) {
                ForEach(Array(SampleData.vodContents.enumerated()), id: \.element.id) { index, content in
                    VideoSearchRow(content: content)
                        .staggeredAppear(index: index)
                        .padding(.horizontal, 20)
                }
            }
        }
    }

    // MARK: - Clips Results

    private var clipsResultsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("클립 (\(SampleData.clips.count))")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.horizontal, 20)

            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 8),
                GridItem(.flexible(), spacing: 8),
                GridItem(.flexible(), spacing: 8)
            ], spacing: 8) {
                ForEach(Array(SampleData.clips.enumerated()), id: \.element.id) { index, clip in
                    ClipSearchCell(clip: clip)
                        .staggeredAppear(index: index)
                }
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Result Section Helper

    private func resultSection<Content: View>(title: String, count: Int, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title)
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)

                Text("\(count)")
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextTertiary)

                Spacer()

                Button {
                    // navigate to full list
                    withAnimation {
                        selectedTab = tabs.firstIndex(of: title) ?? 0
                    }
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

            content()
        }
    }

    // MARK: - Sub-views for All Results

    private var teamsHorizontalScroll: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(Array(SampleData.teams.prefix(5).enumerated()), id: \.element.id) { index, team in
                    TeamSearchCircle(team: team)
                        .staggeredAppear(index: index)
                }
            }
        }
    }

    private var clubsHorizontalScroll: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(Array(sampleClubs.enumerated()), id: \.element.id) { index, club in
                    ClubSearchCard(club: club)
                        .frame(width: 160)
                        .staggeredAppear(index: index)
                }
            }
        }
    }

    private var liveCardsScroll: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(Array(SampleData.liveContents.enumerated()), id: \.element.id) { index, content in
                    LiveSearchCard(content: content)
                        .frame(width: 280)
                        .staggeredAppear(index: index)
                }
            }
        }
    }

    private var competitionBanners: some View {
        LazyVStack(spacing: 10) {
            ForEach(SampleData.competitions) { comp in
                CompetitionSearchBanner(competition: comp)
            }
        }
    }

    private var videosList: some View {
        LazyVStack(spacing: 10) {
            ForEach(SampleData.vodContents.prefix(3)) { content in
                VideoSearchRow(content: content)
            }
        }
    }

    private var clipsGrid: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 8),
            GridItem(.flexible(), spacing: 8),
            GridItem(.flexible(), spacing: 8)
        ], spacing: 8) {
            ForEach(SampleData.clips.prefix(6)) { clip in
                ClipSearchCell(clip: clip)
            }
        }
    }

    // MARK: - Recent Searches

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("최근 검색")
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)
                Spacer()
                Button("전체 삭제") {}
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextTertiary)
                    .accessibilityLabel("최근 검색 전체 삭제")
            }

            ForEach(recentSearches, id: \.self) { term in
                HStack(spacing: 10) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.caption)
                        .foregroundStyle(Color.pochakTextTertiary)

                    Text(term)
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextPrimary)

                    Spacer()

                    Button {
                        // remove
                    } label: {
                        Image(systemName: "xmark")
                            .font(.caption2)
                            .foregroundStyle(Color.pochakTextTertiary)
                    }
                    .accessibilityLabel("\(term) 삭제")
                }
                .padding(.vertical, 4)
                .contentShape(Rectangle())
                .onTapGesture {
                    searchText = term
                }
            }
        }
    }

    // MARK: - Popular Terms

    private var popularSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("인기 검색어")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)

            FlowLayout(spacing: 8) {
                ForEach(popularTerms, id: \.self) { term in
                    Button {
                        searchText = term
                    } label: {
                        Text(term)
                            .font(.pochakTag)
                            .foregroundStyle(Color.pochakPrimary)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 7)
                            .background(Color.pochakPrimary.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .stroke(Color.pochakPrimary.opacity(0.3), lineWidth: 1)
                            )
                    }
                    .accessibilityLabel("\(term) 검색")
                }
            }
        }
    }

    // MARK: - Trending Content

    private var trendingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("실시간 인기")
                    .font(.pochakTitle04)
                    .foregroundStyle(Color.pochakTextPrimary)
                Spacer()
            }

            ForEach(Array(SampleData.vodContents.prefix(5).enumerated()), id: \.element.id) { index, content in
                HStack(spacing: 12) {
                    Text("\(index + 1)")
                        .font(.pochakTitle04)
                        .foregroundStyle(index < 3 ? Color.pochakPrimary : Color.pochakTextTertiary)
                        .frame(width: 24)

                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(Color.pochakSurface)
                        .frame(width: 80, height: 45)
                        .overlay(
                            Image(systemName: "sportscourt.fill")
                                .font(.caption)
                                .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                        )

                    VStack(alignment: .leading, spacing: 2) {
                        Text(content.title)
                            .font(.pochakBody02)
                            .foregroundStyle(Color.pochakTextPrimary)
                            .lineLimit(1)
                        Text(content.competition)
                            .font(.pochakBody04)
                            .foregroundStyle(Color.pochakTextTertiary)
                            .lineLimit(1)
                    }

                    Spacer()
                }
                .staggeredAppear(index: index)
                .accessibilityLabel("\(index + 1)위, \(content.title)")
            }
        }
    }
}

// MARK: - Club Model

struct ClubResult: Identifiable, Hashable {
    let id: String
    let name: String
    let sport: String
    let memberCount: Int
}

// MARK: - Team Search Circle

private struct TeamSearchCircle: View {
    let team: Team

    var body: some View {
        VStack(spacing: 6) {
            Circle()
                .fill(Color.pochakSurface)
                .frame(width: 60, height: 60)
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
                .frame(width: 68)
                .multilineTextAlignment(.center)

            Text(team.sport)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
        }
        .accessibilityLabel("\(team.name), \(team.sport)")
    }
}

// MARK: - Club Search Card (Square)

private struct ClubSearchCard: View {
    let club: ClubResult

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Square image
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(Color.pochakSurface)
                .aspectRatio(1, contentMode: .fit)
                .overlay(
                    Image(systemName: "person.3.fill")
                        .font(.title2)
                        .foregroundStyle(Color.pochakTextTertiary.opacity(0.2))
                )
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            Text(club.name)
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(1)

            HStack(spacing: 6) {
                Text(club.sport)
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
                Text("|")
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
                Text("멤버 \(club.memberCount)")
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
            }
        }
        .accessibilityLabel("\(club.name), \(club.sport), 멤버 \(club.memberCount)명")
    }
}

// MARK: - Live Search Card

private struct LiveSearchCard: View {
    let content: VideoContent

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.pochakSurface)
                    .aspectRatio(16/9, contentMode: .fill)
                    .overlay(
                        Image(systemName: "video.fill")
                            .font(.title2)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                    )

                HStack(spacing: 6) {
                    PochakBadge(type: .live)
                    HStack(spacing: 3) {
                        Circle()
                            .fill(Color.pochakLive)
                            .frame(width: 5, height: 5)
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
            }
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(Color.pochakLive.opacity(0.4), lineWidth: 1.5)
            )

            Text(content.title)
                .font(.pochakBody02)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)

            Text(content.competition)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
                .lineLimit(1)
        }
        .accessibilityLabel("\(content.title), 라이브")
    }
}

// MARK: - Competition Search Banner

private struct CompetitionSearchBanner: View {
    let competition: Competition

    var body: some View {
        HStack(spacing: 12) {
            // Banner thumbnail
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.pochakSurface, Color.pochakSurfaceVar.opacity(0.5)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 100, height: 60)
                .overlay(
                    Image(systemName: "trophy.fill")
                        .font(.title3)
                        .foregroundStyle(Color.pochakClip.opacity(0.3))
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(competition.name)
                    .font(.pochakBody01)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .lineLimit(1)

                Text(competition.dateRange)
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakTextTertiary)

                HStack(spacing: 4) {
                    Text(competition.category)
                        .font(.pochakBody04)
                        .foregroundStyle(Color.pochakTextSecondary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.pochakSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.pochakTextTertiary)
        }
        .padding(12)
        .background(Color.pochakCard)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.pochakBorder.opacity(0.2), lineWidth: 1)
        )
        .accessibilityLabel("\(competition.name), \(competition.dateRange)")
    }
}

// MARK: - Video Search Row

private struct VideoSearchRow: View {
    let content: VideoContent

    var body: some View {
        HStack(spacing: 12) {
            ZStack(alignment: .bottomTrailing) {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 120, height: 68)
                    .overlay(
                        Image(systemName: "video.fill")
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                    )

                Text(content.duration)
                    .font(.pochakBody04)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 1)
                    .background(Color.black.opacity(0.7))
                    .clipShape(RoundedRectangle(cornerRadius: 3))
                    .padding(4)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(content.title)
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .lineLimit(2)
                Text(content.competition)
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Text(content.date)
                    HStack(spacing: 3) {
                        Image(systemName: "eye.fill")
                            .font(.system(size: 9))
                        Text("\(content.viewCount)")
                    }
                }
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
            }

            Spacer()
        }
        .accessibilityLabel("\(content.title), \(content.competition)")
    }
}

// MARK: - Clip Search Cell

private struct ClipSearchCell: View {
    let clip: ClipItem

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            ZStack(alignment: .bottomLeading) {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakSurface)
                    .aspectRatio(1, contentMode: .fit)
                    .overlay(
                        Image(systemName: "film")
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                    )

                PochakBadge(type: .clip)
                    .padding(6)
            }
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            Text(clip.title)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(2)

            HStack(spacing: 3) {
                Image(systemName: "eye.fill")
                    .font(.system(size: 8))
                Text("\(clip.viewCount)")
                    .font(.pochakBody04)
            }
            .foregroundStyle(Color.pochakTextTertiary)
        }
        .accessibilityLabel("\(clip.title), 조회수 \(clip.viewCount)")
    }
}

// MARK: - Preview

#Preview {
    SearchView()
        .preferredColorScheme(.dark)
}
