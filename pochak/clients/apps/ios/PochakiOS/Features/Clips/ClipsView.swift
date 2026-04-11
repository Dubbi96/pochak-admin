// ClipsView.swift
// Pochak OTT Platform - Clips Screen (TikTok/Reels style vertical feed)
// Design ref: Full-screen snap-scrolling clip feed with interaction overlay

import SwiftUI

struct ClipsView: View {

    // MARK: - State

    @State private var currentClipIndex = 0
    @State private var isMuted = false
    @State private var showAIMode = false
    @State private var showComments = false
    @State private var showShareSheet = false
    @State private var showMoreOptions = false
    @State private var clipInteractions: [String: ClipInteraction] = [:]

    // Extended clip data for the feed
    private let clipFeed: [ClipFeedItem] = ClipFeedItem.sampleFeed

    // MARK: - Body

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            // Vertical snap-scrolling clip feed
            TabView(selection: $currentClipIndex) {
                ForEach(Array(clipFeed.enumerated()), id: \.element.id) { index, clip in
                    ClipFullScreenView(
                        clip: clip,
                        isMuted: $isMuted,
                        interaction: bindingForClip(clip.id),
                        onCommentTap: { showComments = true },
                        onShareTap: { showShareSheet = true },
                        onMoreTap: { showMoreOptions = true }
                    )
                    .tag(index)
                    .ignoresSafeArea()
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .ignoresSafeArea()

            // Top overlay: sound toggle + AI mode
            topOverlay

            // Comments sheet
            if showComments {
                commentsOverlay
            }
        }
        .sheet(isPresented: $showMoreOptions) {
            moreOptionsSheet
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
        .statusBarHidden(true)
    }

    // MARK: - Top Overlay

    private var topOverlay: some View {
        VStack {
            HStack {
                // Sound toggle
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        isMuted.toggle()
                    }
                } label: {
                    Image(systemName: isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(10)
                        .background(Color.black.opacity(0.4))
                        .clipShape(Circle())
                }
                .accessibilityLabel(isMuted ? "음소거 해제" : "음소거")

                Spacer()

                // AI Mode toggle
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        showAIMode.toggle()
                    }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 14, weight: .semibold))
                        Text("AI")
                            .font(.pochakBadge)
                    }
                    .foregroundStyle(showAIMode ? Color.pochakTextOnPrimary : .white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(showAIMode ? Color.pochakPrimary : Color.black.opacity(0.4))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .accessibilityLabel(showAIMode ? "AI 모드 끄기" : "AI 모드 켜기")
            }
            .padding(.horizontal, 16)
            .padding(.top, 56)

            Spacer()
        }
    }

    // MARK: - Comments Overlay

    private var commentsOverlay: some View {
        VStack {
            Spacer()

            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("댓글")
                        .font(.pochakTitle04)
                        .foregroundStyle(Color.pochakTextPrimary)
                    Text("0")
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextTertiary)

                    Spacer()

                    Button {
                        withAnimation(.easeOut(duration: 0.25)) {
                            showComments = false
                        }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Color.pochakTextSecondary)
                            .padding(8)
                    }
                    .accessibilityLabel("댓글 닫기")
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 12)

                Rectangle()
                    .fill(Color.pochakDivider)
                    .frame(height: 1)

                // Empty state
                VStack(spacing: 12) {
                    Image(systemName: "bubble.left.and.bubble.right")
                        .font(.system(size: 36))
                        .foregroundStyle(Color.pochakTextTertiary.opacity(0.4))
                    Text("첫 댓글을 남겨보세요!")
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextTertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 48)

                // Comment input
                HStack(spacing: 10) {
                    Circle()
                        .fill(Color.pochakSurface)
                        .frame(width: 32, height: 32)
                        .overlay(
                            Image(systemName: "person.fill")
                                .font(.caption)
                                .foregroundStyle(Color.pochakTextTertiary)
                        )

                    Text("댓글을 입력하세요...")
                        .font(.pochakBody02)
                        .foregroundStyle(Color.pochakTextTertiary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(Color.pochakSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
            .background(Color.pochakBgDeep)
            .clipShape(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
            )
            .frame(height: 360)
        }
        .background(Color.black.opacity(0.4))
        .ignoresSafeArea()
        .transition(.move(edge: .bottom))
        .onTapGesture {
            withAnimation(.easeOut(duration: 0.25)) {
                showComments = false
            }
        }
    }

    // MARK: - More Options Sheet

    private var moreOptionsSheet: some View {
        VStack(spacing: 0) {
            // Options grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 24) {
                MoreOptionItem(icon: "flag", label: "신고")
                MoreOptionItem(icon: "hand.thumbsdown", label: "관심없음")
                MoreOptionItem(icon: "doc.on.doc", label: "복사")
                MoreOptionItem(icon: "bookmark", label: "저장")
                MoreOptionItem(icon: "arrow.down.circle", label: "다운로드")
                MoreOptionItem(icon: "person.badge.plus", label: "팔로우")
                MoreOptionItem(icon: "bell", label: "알림")
                MoreOptionItem(icon: "exclamationmark.bubble", label: "피드백")
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 24)

            Rectangle()
                .fill(Color.pochakDivider)
                .frame(height: 1)

            // Cancel
            Button {
                showMoreOptions = false
            } label: {
                Text("취소")
                    .font(.pochakBody01)
                    .foregroundStyle(Color.pochakTextPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
            }
        }
        .background(Color.pochakBgDeep)
    }

    // MARK: - Helpers

    private func bindingForClip(_ clipId: String) -> Binding<ClipInteraction> {
        Binding(
            get: { clipInteractions[clipId] ?? ClipInteraction() },
            set: { clipInteractions[clipId] = $0 }
        )
    }
}

// MARK: - Clip Interaction State

struct ClipInteraction {
    var isLiked = false
    var likeCount = Int.random(in: 50...5000)
    var commentCount = 0
}

// MARK: - Clip Feed Item Model

struct ClipFeedItem: Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let competition: String
    let creatorName: String
    let creatorAvatar: String
    let likeCount: Int
    let commentCount: Int
    let shareCount: Int
    let tags: [String]

    static let sampleFeed: [ClipFeedItem] = (1...10).map { i in
        ClipFeedItem(
            id: "clip_feed_\(i)",
            title: "스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력을 겨루는 활동 #\(i)",
            description: "이번 경기 최고의 하이라이트 모음",
            competition: "6회 MLB컵 리틀야구 U10",
            creatorName: "포착스포츠",
            creatorAvatar: "avatar_\(i)",
            likeCount: Int.random(in: 100...9999),
            commentCount: Int.random(in: 5...500),
            shareCount: Int.random(in: 10...1000),
            tags: ["야구", "하이라이트", "U10"]
        )
    }
}

// MARK: - Clip Full Screen View

private struct ClipFullScreenView: View {
    let clip: ClipFeedItem
    @Binding var isMuted: Bool
    @Binding var interaction: ClipInteraction
    let onCommentTap: () -> Void
    let onShareTap: () -> Void
    let onMoreTap: () -> Void

    @State private var isPlaying = true
    @State private var showDoubleTapHeart = false
    @State private var doubleTapLocation: CGPoint = .zero
    @State private var progress: CGFloat = 0.35

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Video placeholder
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(hex: "#1a1a2e"),
                                Color(hex: "#16213e"),
                                Color(hex: "#0f3460")
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        VStack(spacing: 8) {
                            Image(systemName: "film.stack.fill")
                                .font(.system(size: 56))
                                .foregroundStyle(.white.opacity(0.15))
                            if !isPlaying {
                                Image(systemName: "play.fill")
                                    .font(.system(size: 40))
                                    .foregroundStyle(.white.opacity(0.7))
                                    .transition(.scale.combined(with: .opacity))
                            }
                        }
                    )
                    .contentShape(Rectangle())
                    .onTapGesture(count: 2) { location in
                        // Double tap to like
                        doubleTapLocation = location
                        withAnimation(.spring(response: 0.3)) {
                            interaction.isLiked = true
                            interaction.likeCount += 1
                            showDoubleTapHeart = true
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                            withAnimation { showDoubleTapHeart = false }
                        }
                    }
                    .onTapGesture(count: 1) {
                        withAnimation(.easeOut(duration: 0.2)) {
                            isPlaying.toggle()
                        }
                    }

                // Double-tap heart animation
                if showDoubleTapHeart {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 80))
                        .foregroundStyle(Color.pochakLive)
                        .position(doubleTapLocation)
                        .transition(.scale.combined(with: .opacity))
                        .shadow(color: Color.pochakLive.opacity(0.5), radius: 12)
                }

                // Bottom gradient
                VStack {
                    Spacer()
                    LinearGradient(
                        colors: [.clear, .black.opacity(0.7), .black.opacity(0.9)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: geometry.size.height * 0.45)
                }

                // Right side interaction buttons
                VStack {
                    Spacer()

                    VStack(spacing: 20) {
                        // Creator avatar
                        VStack(spacing: 6) {
                            ZStack(alignment: .bottom) {
                                Circle()
                                    .fill(Color.pochakSurface)
                                    .frame(width: 46, height: 46)
                                    .overlay(
                                        Image(systemName: "person.fill")
                                            .font(.body)
                                            .foregroundStyle(Color.pochakTextSecondary)
                                    )
                                    .overlay(
                                        Circle()
                                            .stroke(Color.pochakPrimary, lineWidth: 2)
                                    )

                                // Follow button
                                Image(systemName: "plus")
                                    .font(.system(size: 10, weight: .heavy))
                                    .foregroundStyle(.white)
                                    .padding(4)
                                    .background(Color.pochakPrimary)
                                    .clipShape(Circle())
                                    .offset(y: 8)
                            }
                        }

                        // Like button
                        ClipActionButton(
                            icon: interaction.isLiked ? "heart.fill" : "heart",
                            count: formatCount(interaction.likeCount),
                            color: interaction.isLiked ? .pochakLive : .white
                        ) {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                                interaction.isLiked.toggle()
                                interaction.likeCount += interaction.isLiked ? 1 : -1
                            }
                        }

                        // Comment button
                        ClipActionButton(
                            icon: "bubble.right",
                            count: formatCount(clip.commentCount),
                            color: .white
                        ) {
                            onCommentTap()
                        }

                        // Share button
                        ClipActionButton(
                            icon: "arrowshape.turn.up.right",
                            count: formatCount(clip.shareCount),
                            color: .white
                        ) {
                            onShareTap()
                        }

                        // More button
                        ClipActionButton(
                            icon: "ellipsis",
                            count: nil,
                            color: .white
                        ) {
                            onMoreTap()
                        }
                    }
                    .padding(.trailing, 12)
                    .padding(.bottom, 120)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                }

                // Bottom info
                VStack {
                    Spacer()

                    VStack(alignment: .leading, spacing: 8) {
                        // Creator name
                        HStack(spacing: 6) {
                            Text("@\(clip.creatorName)")
                                .font(.pochakBody02)
                                .fontWeight(.semibold)
                                .foregroundStyle(.white)

                            // Verified badge
                            Image(systemName: "checkmark.seal.fill")
                                .font(.caption)
                                .foregroundStyle(Color.pochakPrimary)
                        }

                        // Title
                        Text(clip.title)
                            .font(.pochakBody02)
                            .foregroundStyle(.white)
                            .lineLimit(2)

                        // Competition
                        HStack(spacing: 4) {
                            Image(systemName: "trophy.fill")
                                .font(.system(size: 10))
                            Text(clip.competition)
                                .font(.pochakBody03)
                        }
                        .foregroundStyle(.white.opacity(0.7))

                        // Tags
                        HStack(spacing: 6) {
                            ForEach(clip.tags, id: \.self) { tag in
                                Text("#\(tag)")
                                    .font(.pochakBody03)
                                    .foregroundStyle(Color.pochakPrimary)
                            }
                        }

                        // Progress bar
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 1)
                                    .fill(.white.opacity(0.2))
                                    .frame(height: 2)
                                RoundedRectangle(cornerRadius: 1)
                                    .fill(.white)
                                    .frame(width: geo.size.width * progress, height: 2)
                            }
                        }
                        .frame(height: 2)
                        .padding(.top, 4)
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 100)
                    .padding(.trailing, 60)
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
    }

    private func formatCount(_ count: Int) -> String {
        if count >= 10000 {
            return String(format: "%.1f만", Double(count) / 10000.0)
        } else if count >= 1000 {
            return String(format: "%.1fK", Double(count) / 1000.0)
        }
        return "\(count)"
    }
}

// MARK: - Clip Action Button

private struct ClipActionButton: View {
    let icon: String
    let count: String?
    let color: Color
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button {
            action()
            withAnimation(.spring(response: 0.2, dampingFraction: 0.5)) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                isPressed = false
            }
        } label: {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 26, weight: .semibold))
                    .foregroundStyle(color)
                    .scaleEffect(isPressed ? 1.3 : 1.0)

                if let count = count {
                    Text(count)
                        .font(.pochakBody04)
                        .foregroundStyle(.white.opacity(0.8))
                }
            }
        }
        .accessibilityLabel(icon)
    }
}

// MARK: - More Option Item

private struct MoreOptionItem: View {
    let icon: String
    let label: String

    var body: some View {
        Button {
            // action
        } label: {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundStyle(Color.pochakTextPrimary)
                    .frame(width: 48, height: 48)
                    .background(Color.pochakSurface)
                    .clipShape(Circle())

                Text(label)
                    .font(.pochakBody04)
                    .foregroundStyle(Color.pochakTextSecondary)
            }
        }
        .accessibilityLabel(label)
    }
}

// MARK: - Preview

#Preview {
    ClipsView()
        .preferredColorScheme(.dark)
}
