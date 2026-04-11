// PochakColors.swift
// Pochak OTT Platform - Design Token System
// Based on tokens.json + Figma Mobile Design 3.0

import SwiftUI

// MARK: - Core Brand Colors

extension Color {

    // -- Background Hierarchy --
    static let pochakBg          = Color(hex: "#1A1A1A")
    static let pochakBgDeep      = Color(hex: "#121212")
    static let pochakSurface     = Color(hex: "#262626")
    static let pochakSurfaceVar  = Color(hex: "#404040")
    static let pochakCard        = Color(hex: "#262626")
    static let pochakElevated    = Color(hex: "#2A2A2A")

    // -- Brand --
    static let pochakPrimary     = Color(hex: "#00CC33")
    static let pochakPrimaryLt   = Color(hex: "#69F0AE")
    static let pochakPrimaryDk   = Color(hex: "#00A844")
    static let pochakAccent      = Color(hex: "#00FF00")

    // -- Semantic --
    static let pochakLive        = Color(hex: "#E51728")
    static let pochakLiveGlow    = Color(hex: "#FF1744")
    static let pochakWarning     = Color(hex: "#FFD740")
    static let pochakInfo        = Color(hex: "#6699FF")
    static let pochakVOD         = Color(hex: "#00CC33")
    static let pochakClip        = Color(hex: "#FFB300")
    static let pochakScheduled   = Color(hex: "#9E9E9E")

    // -- Text --
    static let pochakTextPrimary   = Color.white
    static let pochakTextSecondary = Color(hex: "#A6A6A6")
    static let pochakTextTertiary  = Color(hex: "#606060")
    static let pochakTextOnPrimary = Color.black

    // -- Border & Divider --
    static let pochakBorder      = Color(hex: "#4D4D4D")
    static let pochakDivider     = Color.white.opacity(0.12)

    // -- SNS Login --
    static let kakaoYellow       = Color(hex: "#FEE500")
    static let naverGreen        = Color(hex: "#03C75A")
    static let googleWhite       = Color.white
    static let appleDark         = Color.black

    // -- Tab Bar --
    static let pochakTabBg       = Color(hex: "#1E1E1E")
    static let pochakTabBorder   = Color(hex: "#2A2A2A")
    static let pochakTabInactive = Color(hex: "#808080")
}

// MARK: - Gradients

extension LinearGradient {

    /// Background: subtle top-lit radial feel via linear approximation
    static let pochakBgGradient = LinearGradient(
        colors: [Color(hex: "#1E1E1E"), Color(hex: "#121212")],
        startPoint: .top,
        endPoint: .bottom
    )

    /// Hero overlay: fades image into background
    static let pochakHeroOverlay = LinearGradient(
        colors: [.clear, Color(hex: "#1A1A1A").opacity(0.85), Color(hex: "#1A1A1A")],
        startPoint: .top,
        endPoint: .bottom
    )

    /// Brand shimmer for logo text
    static let pochakLogoGradient = LinearGradient(
        colors: [Color(hex: "#00CC33"), Color(hex: "#00FF00"), Color(hex: "#69F0AE")],
        startPoint: .leading,
        endPoint: .trailing
    )

    /// Subscription banner
    static let pochakSubscriptionGradient = LinearGradient(
        colors: [Color(hex: "#00A844"), Color(hex: "#00CC33"), Color(hex: "#69F0AE")],
        startPoint: .leading,
        endPoint: .trailing
    )

    /// Bottom action bar (green CTA)
    static let pochakCTAGradient = LinearGradient(
        colors: [Color(hex: "#00CC33"), Color(hex: "#00FF00")],
        startPoint: .leading,
        endPoint: .trailing
    )
}

extension RadialGradient {

    /// Ambient background glow
    static let pochakAmbient = RadialGradient(
        colors: [Color(hex: "#00CC33").opacity(0.06), Color.clear],
        center: .top,
        startRadius: 0,
        endRadius: 500
    )

    /// Login screen subtle glow
    static let pochakLoginGlow = RadialGradient(
        colors: [Color(hex: "#00CC33").opacity(0.08), Color(hex: "#1A1A1A")],
        center: .center,
        startRadius: 50,
        endRadius: 400
    )
}

// MARK: - Hex Initializer

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
