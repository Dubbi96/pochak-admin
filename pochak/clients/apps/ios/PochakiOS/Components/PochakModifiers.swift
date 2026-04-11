// PochakModifiers.swift
// Pochak OTT Platform - Shared ViewModifiers & Reusable Components

import SwiftUI

// MARK: - Card Modifier

struct PochakCardModifier: ViewModifier {
    var isPressed: Bool = false

    func body(content: Content) -> some View {
        content
            .background(Color.pochakCard)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(isPressed ? Color.pochakPrimary.opacity(0.5) : Color.pochakBorder.opacity(0.3), lineWidth: 1)
            )
            .shadow(
                color: isPressed ? Color.pochakPrimary.opacity(0.15) : .clear,
                radius: isPressed ? 12 : 0,
                x: 0, y: 0
            )
    }
}

extension View {
    func pochakCard(isPressed: Bool = false) -> some View {
        modifier(PochakCardModifier(isPressed: isPressed))
    }
}

// MARK: - Glow Modifier

struct PochakGlowModifier: ViewModifier {
    var color: Color = .pochakPrimary
    var radius: CGFloat = 8

    func body(content: Content) -> some View {
        content
            .shadow(color: color.opacity(0.25), radius: radius, x: 0, y: 0)
    }
}

extension View {
    func pochakGlow(color: Color = .pochakPrimary, radius: CGFloat = 8) -> some View {
        modifier(PochakGlowModifier(color: color, radius: radius))
    }
}

// MARK: - Badge View

enum PochakBadgeType {
    case live, vod, clip, scheduled, free

    var label: String {
        switch self {
        case .live: return "LIVE"
        case .vod: return "VOD"
        case .clip: return "CLIP"
        case .scheduled: return "예정"
        case .free: return "무료"
        }
    }

    var color: Color {
        switch self {
        case .live: return .pochakLive
        case .vod: return .pochakVOD
        case .clip: return .pochakClip
        case .scheduled: return .pochakScheduled
        case .free: return .pochakTextSecondary
        }
    }
}

struct PochakBadge: View {
    let type: PochakBadgeType
    @State private var isPulsing = false

    var body: some View {
        Text(type.label)
            .font(.pochakBadge)
            .foregroundStyle(type == .live ? .white : Color.pochakTextOnPrimary)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(type.color)
            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
            .scaleEffect(type == .live && isPulsing ? 1.05 : 1.0)
            .animation(
                type == .live
                    ? .easeInOut(duration: 0.8).repeatForever(autoreverses: true)
                    : .default,
                value: isPulsing
            )
            .onAppear {
                if type == .live { isPulsing = true }
            }
            .accessibilityLabel("\(type.label) 상태")
    }
}

// MARK: - Button Styles

struct PochakPrimaryButtonStyle: ButtonStyle {
    var isEnabled: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.pochakButton)
            .foregroundStyle(Color.pochakTextOnPrimary)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(
                isEnabled
                    ? LinearGradient.pochakCTAGradient
                    : LinearGradient(colors: [Color.pochakSurfaceVar], startPoint: .leading, endPoint: .trailing)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
            .accessibilityAddTraits(.isButton)
    }
}

struct PochakSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.pochakButton)
            .foregroundStyle(Color.pochakPrimary)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(Color.pochakPrimary, lineWidth: 1.5)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

struct PochakGhostButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.pochakBody02)
            .foregroundStyle(Color.pochakTextSecondary)
            .opacity(configuration.isPressed ? 0.5 : 1.0)
    }
}

// MARK: - TextField Style

struct PochakTextFieldStyle: TextFieldStyle {
    var isFocused: Bool = false

    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(.pochakBody01)
            .foregroundStyle(Color.pochakTextPrimary)
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(Color.pochakSurface)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(
                        isFocused ? Color.pochakPrimary : Color.pochakBorder.opacity(0.4),
                        lineWidth: isFocused ? 1.5 : 1
                    )
            )
            .shadow(
                color: isFocused ? Color.pochakPrimary.opacity(0.12) : .clear,
                radius: isFocused ? 6 : 0
            )
    }
}

// MARK: - Shimmer / Skeleton

struct ShimmerView: View {
    @State private var phase: CGFloat = -1.0

    var body: some View {
        GeometryReader { geo in
            Rectangle()
                .fill(Color.pochakSurface)
                .overlay(
                    LinearGradient(
                        colors: [
                            Color.pochakSurface,
                            Color.pochakSurfaceVar.opacity(0.6),
                            Color.pochakSurface
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geo.size.width * 0.6)
                    .offset(x: phase * geo.size.width)
                )
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .onAppear {
                    withAnimation(
                        .linear(duration: 1.2)
                        .repeatForever(autoreverses: false)
                    ) {
                        phase = 1.5
                    }
                }
        }
        .accessibilityLabel("로딩 중")
    }
}

// MARK: - Staggered Appearance

struct StaggeredAppearModifier: ViewModifier {
    let index: Int
    @State private var appeared = false

    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 12)
            .animation(
                .easeOut(duration: 0.35).delay(Double(index) * 0.05),
                value: appeared
            )
            .onAppear { appeared = true }
    }
}

extension View {
    func staggeredAppear(index: Int) -> some View {
        modifier(StaggeredAppearModifier(index: index))
    }
}

// MARK: - Flow Layout (for tags)

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                                  proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }
        return (positions, CGSize(width: maxWidth, height: y + rowHeight))
    }
}

// MARK: - Previews

#Preview("Badges") {
    HStack(spacing: 12) {
        PochakBadge(type: .live)
        PochakBadge(type: .vod)
        PochakBadge(type: .clip)
        PochakBadge(type: .scheduled)
        PochakBadge(type: .free)
    }
    .padding()
    .background(Color.pochakBg)
}

#Preview("Shimmer") {
    ShimmerView()
        .frame(width: 200, height: 120)
        .padding()
        .background(Color.pochakBg)
}
