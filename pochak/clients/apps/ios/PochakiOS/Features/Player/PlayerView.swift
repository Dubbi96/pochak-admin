// PlayerView.swift
// Pochak OTT Platform - Video Player Screen
// Design ref: Player Page - 16:9 video + controls overlay + camera views + match info + content tabs

import SwiftUI
import AVKit

struct PlayerView: View {

    let content: VideoContent

    // MARK: - State

    @State private var player: AVPlayer?
    @State private var isPlaying = true
    @State private var showControls = true
    @State private var isLiked = false
    @State private var likeCount = 342
    @State private var showComments = false
    @State private var commentText = ""
    @State private var progress: CGFloat = 0.35
    @State private var currentTime = "00:32:15"
    @State private var selectedCameraView = 0
    @State private var selectedContentTab = 0
    @State private var selectedRelatedToggle = 0
    @State private var showSettingsSheet = false
    @State private var showSpeedSheet = false
    @State private var isFullscreen = false
    @State private var showClipCreation = false
    @Environment(\.dismiss) private var dismiss

    private let cameraViews = ["AI", "PANO", "SIDE A", "SIDE B", "CAM 1", "CAM 2"]
    private let contentTabs = ["추천영상", "관련영상", "내클립"]
    private let relatedToggles = ["영상", "클립"]

    // Placeholder related content
    private let relatedClips = SampleData.clips
    private let relatedVideos = Array(SampleData.vodContents.prefix(6))

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                Color.pochakBg.ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {

                        // -- Video Player with Controls --
                        videoPlayerSection

                        // -- Camera View Strip --
                        cameraViewStrip
                            .padding(.top, 4)

                        // -- Match Info --
                        matchInfoSection
                            .padding(.horizontal, 20)
                            .padding(.top, 16)

                        // -- Tags (horizontal scroll chips) --
                        tagScrollSection
                            .padding(.top, 12)

                        // -- Description --
                        descriptionSection
                            .padding(.horizontal, 20)
                            .padding(.top, 12)

                        // -- Action Row --
                        actionRow
                            .padding(.horizontal, 20)
                            .padding(.top, 16)

                        Rectangle()
                            .fill(Color.pochakDivider)
                            .frame(height: 1)
                            .padding(.vertical, 16)

                        // -- Content Tabs --
                        contentTabsSection

                        Spacer().frame(height: 100)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "chevron.left")
                            .foregroundStyle(Color.pochakTextPrimary)
                    }
                    .accessibilityLabel("뒤로 가기")
                }
            }
        }
        .sheet(isPresented: $showSettingsSheet) {
            settingsSheet
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $showSpeedSheet) {
            speedSheet
                .presentationDetents([.height(280)])
                .presentationDragIndicator(.visible)
        }
    }

    // MARK: - Video Player Section

    private var videoPlayerSection: some View {
        ZStack {
            // Video placeholder (16:9)
            Rectangle()
                .fill(Color.black)
                .aspectRatio(16/9, contentMode: .fit)
                .overlay(
                    ZStack {
                        // Placeholder content
                        Image(systemName: "sportscourt.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(Color.white.opacity(0.1))

                        // Controls overlay
                        if showControls {
                            controlsOverlay
                                .transition(.opacity)
                        }

                        // Live badge overlay
                        if content.type == .live {
                            VStack {
                                HStack {
                                    PochakBadge(type: .live)
                                    Spacer()
                                }
                                Spacer()
                            }
                            .padding(16)
                        }
                    }
                )
                .contentShape(Rectangle())
                .onTapGesture {
                    withAnimation(.easeOut(duration: 0.2)) {
                        showControls.toggle()
                    }
                    // Auto-hide after 3s
                    if showControls {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                            withAnimation(.easeOut(duration: 0.3)) {
                                showControls = false
                            }
                        }
                    }
                }
        }
        .accessibilityLabel("영상 플레이어")
    }

    // MARK: - Controls Overlay

    private var controlsOverlay: some View {
        ZStack {
            // Dim background
            Color.black.opacity(0.4)

            VStack {
                // Top controls: back, clip, PIP, timeline, settings
                HStack(spacing: 16) {
                    // Back button (overlay, different from nav bar)
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(.white)
                    }
                    .accessibilityLabel("뒤로")

                    Spacer()

                    // Clip creation
                    Button {
                        showClipCreation = true
                    } label: {
                        Image(systemName: "scissors")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.white)
                            .padding(8)
                            .background(.white.opacity(0.15))
                            .clipShape(Circle())
                    }
                    .accessibilityLabel("클립 만들기")

                    // PIP
                    Button {
                        // PIP
                    } label: {
                        Image(systemName: "pip.enter")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.white)
                            .padding(8)
                            .background(.white.opacity(0.15))
                            .clipShape(Circle())
                    }
                    .accessibilityLabel("화면 속 화면")

                    // Timeline events
                    Button {
                        // timeline events
                    } label: {
                        Image(systemName: "list.bullet.rectangle")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.white)
                            .padding(8)
                            .background(.white.opacity(0.15))
                            .clipShape(Circle())
                    }
                    .accessibilityLabel("타임라인")

                    // Settings
                    Button {
                        showSettingsSheet = true
                    } label: {
                        Image(systemName: "gearshape")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.white)
                            .padding(8)
                            .background(.white.opacity(0.15))
                            .clipShape(Circle())
                    }
                    .accessibilityLabel("설정")
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)

                Spacer()

                // Center: play/pause + seek controls
                HStack(spacing: 40) {
                    // Seek backward 10s
                    Button {
                        // seek -10s
                    } label: {
                        Image(systemName: "gobackward.10")
                            .font(.system(size: 28, weight: .medium))
                            .foregroundStyle(.white)
                    }
                    .accessibilityLabel("10초 뒤로")

                    // Play/Pause
                    Button {
                        withAnimation(.spring(response: 0.2)) {
                            isPlaying.toggle()
                        }
                    } label: {
                        Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                            .font(.system(size: 36, weight: .medium))
                            .foregroundStyle(.white)
                    }
                    .accessibilityLabel(isPlaying ? "일시정지" : "재생")

                    // Seek forward 10s
                    Button {
                        // seek +10s
                    } label: {
                        Image(systemName: "goforward.10")
                            .font(.system(size: 28, weight: .medium))
                            .foregroundStyle(.white)
                    }
                    .accessibilityLabel("10초 앞으로")
                }

                Spacer()

                // Bottom: progress bar + time + fullscreen
                VStack(spacing: 4) {
                    // Seek bar
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            // Track
                            RoundedRectangle(cornerRadius: 2)
                                .fill(.white.opacity(0.3))
                                .frame(height: 3)

                            // Buffer indicator
                            RoundedRectangle(cornerRadius: 2)
                                .fill(.white.opacity(0.15))
                                .frame(width: geo.size.width * 0.6, height: 3)

                            // Progress
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.pochakPrimary)
                                .frame(width: geo.size.width * progress, height: 3)

                            // Thumb
                            Circle()
                                .fill(Color.pochakPrimary)
                                .frame(width: 12, height: 12)
                                .offset(x: geo.size.width * progress - 6)
                                .shadow(color: Color.pochakPrimary.opacity(0.4), radius: 4)
                        }
                        .gesture(
                            DragGesture(minimumDistance: 0)
                                .onChanged { value in
                                    let newProgress = max(0, min(1, value.location.x / geo.size.width))
                                    progress = newProgress
                                }
                        )
                    }
                    .frame(height: 12)

                    // Time + controls
                    HStack {
                        Text(currentTime)
                            .font(.pochakBody04)
                            .foregroundStyle(.white)
                        Text("/")
                            .font(.pochakBody04)
                            .foregroundStyle(.white.opacity(0.5))
                        Text(content.duration)
                            .font(.pochakBody04)
                            .foregroundStyle(.white.opacity(0.7))

                        Spacer()

                        // Speed
                        Button {
                            showSpeedSheet = true
                        } label: {
                            Text("1.0x")
                                .font(.pochakBody03)
                                .foregroundStyle(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(.white.opacity(0.15))
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                        }
                        .accessibilityLabel("재생 속도")

                        // Fullscreen
                        Button {
                            isFullscreen.toggle()
                        } label: {
                            Image(systemName: isFullscreen ? "arrow.down.right.and.arrow.up.left" : "arrow.up.left.and.arrow.down.right")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(.white)
                        }
                        .accessibilityLabel(isFullscreen ? "전체화면 해제" : "전체화면")
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
            }
        }
    }

    // MARK: - Camera View Strip

    private var cameraViewStrip: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(cameraViews.enumerated()), id: \.offset) { index, cam in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedCameraView = index
                        }
                    } label: {
                        VStack(spacing: 4) {
                            // Camera thumbnail
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .fill(Color.pochakSurface)
                                .frame(width: 80, height: 45)
                                .overlay(
                                    Image(systemName: index == 0 ? "sparkles" : "video.fill")
                                        .font(.caption)
                                        .foregroundStyle(
                                            selectedCameraView == index
                                                ? Color.pochakPrimary
                                                : Color.pochakTextTertiary.opacity(0.4)
                                        )
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                                        .stroke(
                                            selectedCameraView == index
                                                ? Color.pochakPrimary
                                                : Color.pochakBorder.opacity(0.2),
                                            lineWidth: selectedCameraView == index ? 2 : 1
                                        )
                                )

                            Text(cam)
                                .font(.pochakBody04)
                                .foregroundStyle(
                                    selectedCameraView == index
                                        ? Color.pochakPrimary
                                        : Color.pochakTextSecondary
                                )
                        }
                    }
                    .accessibilityLabel("\(cam) 카메라 뷰")
                    .accessibilityAddTraits(selectedCameraView == index ? .isSelected : [])
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
        .background(Color.pochakBgDeep)
    }

    // MARK: - Match Info Section

    private var matchInfoSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Title
            Text(content.title)
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)

            // Teams row
            HStack(spacing: 16) {
                teamBadge(name: content.homeTeam, side: "홈")

                // Score or VS
                VStack(spacing: 2) {
                    if content.type == .live || content.type == .vod {
                        HStack(spacing: 8) {
                            Text("3")
                                .font(.pochakTitle03)
                                .foregroundStyle(Color.pochakTextPrimary)
                            Text(":")
                                .font(.pochakTitle04)
                                .foregroundStyle(Color.pochakTextTertiary)
                            Text("2")
                                .font(.pochakTitle03)
                                .foregroundStyle(Color.pochakTextPrimary)
                        }
                    } else {
                        Text("vs")
                            .font(.pochakBody01)
                            .foregroundStyle(Color.pochakTextTertiary)
                    }
                }

                teamBadge(name: content.awayTeam, side: "원정")
            }
            .frame(maxWidth: .infinity)

            // Competition
            HStack(spacing: 6) {
                Circle()
                    .fill(Color.pochakSurface)
                    .frame(width: 20, height: 20)
                    .overlay(
                        Image(systemName: "trophy.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(Color.pochakClip)
                    )

                Text(content.competition)
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextSecondary)

                Spacer()

                // Date + view count
                HStack(spacing: 8) {
                    Text(content.date)
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextTertiary)

                    HStack(spacing: 3) {
                        Image(systemName: "eye.fill")
                            .font(.system(size: 10))
                        Text("\(content.viewCount)")
                            .font(.pochakBody04)
                    }
                    .foregroundStyle(Color.pochakTextTertiary)
                }
            }
        }
        .accessibilityElement(children: .combine)
    }

    private func teamBadge(name: String, side: String) -> some View {
        VStack(spacing: 6) {
            Circle()
                .fill(Color.pochakSurface)
                .frame(width: 48, height: 48)
                .overlay(
                    Text(String(name.prefix(1)))
                        .font(.pochakBody01)
                        .foregroundStyle(Color.pochakTextSecondary)
                )
                .overlay(
                    Circle()
                        .stroke(Color.pochakBorder.opacity(0.3), lineWidth: 1)
                )

            Text(name)
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextPrimary)
                .lineLimit(1)

            Text(side)
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Tags (Horizontal Scroll Chips)

    private var tagScrollSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(content.tags, id: \.self) { tag in
                    Text(tag)
                        .font(.pochakTag)
                        .foregroundStyle(Color.pochakPrimary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(Color.pochakPrimary.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(Color.pochakPrimary.opacity(0.3), lineWidth: 1)
                        )
                }

                // Additional common tags
                ForEach(["하이라이트", "풀영상", "결승"], id: \.self) { tag in
                    Text(tag)
                        .font(.pochakTag)
                        .foregroundStyle(Color.pochakTextSecondary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(Color.pochakSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Description

    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("\(content.homeTeam) vs \(content.awayTeam) 경기 풀영상입니다. \(content.competition)에서 펼쳐진 열띤 경기를 확인하세요.")
                .font(.pochakBody03)
                .foregroundStyle(Color.pochakTextSecondary)
                .lineLimit(2)

            Button {
                // expand
            } label: {
                Text("더보기")
                    .font(.pochakBody03)
                    .foregroundStyle(Color.pochakPrimary)
            }
        }
    }

    // MARK: - Action Row

    private var actionRow: some View {
        HStack(spacing: 0) {
            // Favorite
            actionButton(icon: "star", label: "즐겨찾기", color: .pochakTextSecondary) {}

            // Like with count
            actionButton(
                icon: isLiked ? "heart.fill" : "heart",
                label: "\(likeCount)",
                color: isLiked ? .pochakLive : .pochakTextSecondary
            ) {
                withAnimation(.spring(response: 0.3)) {
                    isLiked.toggle()
                    likeCount += isLiked ? 1 : -1
                }
            }

            // Share
            actionButton(icon: "square.and.arrow.up", label: "공유", color: .pochakTextSecondary) {}

            // More
            actionButton(icon: "ellipsis", label: "더보기", color: .pochakTextSecondary) {}
        }
    }

    private func actionButton(icon: String, label: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundStyle(color)
                Text(label)
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextTertiary)
            }
            .frame(maxWidth: .infinity)
        }
        .accessibilityLabel(label)
    }

    // MARK: - Content Tabs Section

    private var contentTabsSection: some View {
        VStack(spacing: 0) {
            // Tab bar: 추천영상 / 관련영상 / 내클립
            HStack(spacing: 0) {
                ForEach(Array(contentTabs.enumerated()), id: \.offset) { index, tab in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedContentTab = index
                        }
                    } label: {
                        VStack(spacing: 8) {
                            Text(tab)
                                .font(.pochakBody01)
                                .fontWeight(selectedContentTab == index ? .semibold : .regular)
                                .foregroundStyle(
                                    selectedContentTab == index
                                        ? Color.pochakTextPrimary
                                        : Color.pochakTextTertiary
                                )

                            Rectangle()
                                .fill(
                                    selectedContentTab == index
                                        ? Color.pochakPrimary
                                        : Color.clear
                                )
                                .frame(height: 2)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .accessibilityLabel(tab)
                    .accessibilityAddTraits(selectedContentTab == index ? .isSelected : [])
                }
            }
            .padding(.horizontal, 20)

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 1)

            // Tab content
            switch selectedContentTab {
            case 0:
                recommendedVideosContent
                    .padding(.top, 16)
            case 1:
                relatedContent
                    .padding(.top, 12)
            case 2:
                myClipsContent
                    .padding(.top, 16)
            default:
                EmptyView()
            }
        }
    }

    // MARK: - Recommended Videos

    private var recommendedVideosContent: some View {
        LazyVStack(spacing: 12) {
            ForEach(Array(relatedVideos.enumerated()), id: \.element.id) { index, video in
                VideoListRow(content: video)
                    .staggeredAppear(index: index)
                    .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Related Content (with toggle)

    private var relatedContent: some View {
        VStack(spacing: 12) {
            // Toggle: 영상 / 클립
            HStack(spacing: 0) {
                ForEach(Array(relatedToggles.enumerated()), id: \.offset) { index, toggle in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedRelatedToggle = index
                        }
                    } label: {
                        Text(toggle)
                            .font(.pochakBody02)
                            .foregroundStyle(
                                selectedRelatedToggle == index
                                    ? Color.pochakTextOnPrimary
                                    : Color.pochakTextSecondary
                            )
                            .padding(.horizontal, 20)
                            .padding(.vertical, 8)
                            .background(
                                selectedRelatedToggle == index
                                    ? Color.pochakPrimary
                                    : Color.pochakSurface
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    }
                }
            }
            .padding(.horizontal, 20)
            .frame(maxWidth: .infinity, alignment: .leading)

            if selectedRelatedToggle == 0 {
                // Videos
                LazyVStack(spacing: 12) {
                    ForEach(Array(relatedVideos.prefix(4).enumerated()), id: \.element.id) { index, video in
                        VideoListRow(content: video)
                            .staggeredAppear(index: index)
                            .padding(.horizontal, 20)
                    }
                }
            } else {
                // Clips grid
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 8),
                    GridItem(.flexible(), spacing: 8),
                    GridItem(.flexible(), spacing: 8)
                ], spacing: 8) {
                    ForEach(Array(relatedClips.enumerated()), id: \.element.id) { index, clip in
                        RelatedClipCell(clip: clip)
                            .staggeredAppear(index: index)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - My Clips

    private var myClipsContent: some View {
        VStack(spacing: 16) {
            if relatedClips.isEmpty {
                // Empty state
                VStack(spacing: 12) {
                    Image(systemName: "scissors")
                        .font(.system(size: 40))
                        .foregroundStyle(Color.pochakTextTertiary.opacity(0.4))
                    Text("아직 만든 클립이 없습니다")
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextTertiary)
                    Text("영상을 시청하면서 클립을 만들어보세요!")
                        .font(.pochakBody03)
                        .foregroundStyle(Color.pochakTextTertiary)

                    Button {
                        showClipCreation = true
                    } label: {
                        Text("클립 만들기")
                    }
                    .buttonStyle(PochakPrimaryButtonStyle())
                    .frame(width: 160)
                    .padding(.top, 8)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 8),
                    GridItem(.flexible(), spacing: 8),
                    GridItem(.flexible(), spacing: 8)
                ], spacing: 8) {
                    ForEach(Array(relatedClips.prefix(3).enumerated()), id: \.element.id) { index, clip in
                        RelatedClipCell(clip: clip)
                            .staggeredAppear(index: index)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Settings Sheet

    private var settingsSheet: some View {
        VStack(spacing: 0) {
            Text("설정")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.top, 16)
                .padding(.bottom, 20)

            VStack(spacing: 0) {
                settingsRow(icon: "speedometer", label: "재생 속도", value: "1.0x") {
                    showSettingsSheet = false
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        showSpeedSheet = true
                    }
                }
                settingsRow(icon: "textformat.size", label: "자막", value: "OFF") {}
                settingsRow(icon: "speaker.wave.2", label: "음질", value: "자동") {}
                settingsRow(icon: "rectangle.on.rectangle", label: "화면 비율", value: "16:9") {}
                settingsRow(icon: "clock.arrow.circlepath", label: "구간 반복", value: "OFF") {}
                settingsRow(icon: "moon", label: "슬립 타이머", value: "OFF") {}
            }
            .padding(.horizontal, 20)

            Spacer()
        }
        .background(Color.pochakBgDeep)
    }

    private func settingsRow(icon: String, label: String, value: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundStyle(Color.pochakTextSecondary)
                    .frame(width: 28)

                Text(label)
                    .font(.pochakBody01)
                    .foregroundStyle(Color.pochakTextPrimary)

                Spacer()

                Text(value)
                    .font(.pochakBody02)
                    .foregroundStyle(Color.pochakTextTertiary)

                Image(systemName: "chevron.right")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Color.pochakTextTertiary)
            }
            .padding(.vertical, 14)
        }
    }

    // MARK: - Speed Sheet

    private var speedSheet: some View {
        VStack(spacing: 16) {
            Text("재생 속도")
                .font(.pochakTitle04)
                .foregroundStyle(Color.pochakTextPrimary)
                .padding(.top, 16)

            let speeds: [CGFloat] = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
            ForEach(speeds, id: \.self) { speed in
                Button {
                    showSpeedSheet = false
                } label: {
                    HStack {
                        Text(speed == 1.0 ? "보통" : "\(String(format: "%.2g", speed))x")
                            .font(.pochakBody01)
                            .foregroundStyle(speed == 1.0 ? Color.pochakPrimary : Color.pochakTextPrimary)
                        Spacer()
                        if speed == 1.0 {
                            Image(systemName: "checkmark")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(Color.pochakPrimary)
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 8)
                }
            }

            Spacer()
        }
        .background(Color.pochakBgDeep)
    }
}

// MARK: - Video List Row

private struct VideoListRow: View {
    let content: VideoContent

    var body: some View {
        HStack(spacing: 12) {
            // Thumbnail
            ZStack(alignment: .bottomTrailing) {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.pochakSurface)
                    .frame(width: 140, height: 79)
                    .overlay(
                        Image(systemName: "sportscourt.fill")
                            .font(.caption)
                            .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                    )

                Text(content.duration)
                    .font(.pochakBody04)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 2)
                    .background(Color.black.opacity(0.7))
                    .clipShape(RoundedRectangle(cornerRadius: 3))
                    .padding(4)
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

                HStack(spacing: 6) {
                    Text(content.date)
                    Text("|")
                    HStack(spacing: 3) {
                        Image(systemName: "eye.fill")
                            .font(.system(size: 9))
                        Text("\(content.viewCount)")
                    }
                }
                .font(.pochakBody04)
                .foregroundStyle(Color.pochakTextTertiary)
            }

            Spacer(minLength: 0)

            // More button
            Button {
                // options
            } label: {
                Image(systemName: "ellipsis")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color.pochakTextTertiary)
                    .rotationEffect(.degrees(90))
            }
            .accessibilityLabel("옵션")
        }
    }
}

// MARK: - Related Clip Cell

private struct RelatedClipCell: View {
    let clip: ClipItem

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(Color.pochakSurface)
                .aspectRatio(1, contentMode: .fit)
                .overlay(
                    Image(systemName: "film")
                        .foregroundStyle(Color.pochakTextTertiary.opacity(0.3))
                )
                .overlay(alignment: .bottomLeading) {
                    PochakBadge(type: .clip)
                        .padding(6)
                }

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
    }
}

// MARK: - Preview

#Preview {
    PlayerView(content: SampleData.liveContents[0])
        .preferredColorScheme(.dark)
}
