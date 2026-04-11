// PochakTypography.swift
// Pochak OTT Platform - Typography System
// Matches tokens.json fontSize / fontWeight / lineHeight

import SwiftUI

// MARK: - Pretendard Custom Font Registration

struct PochakFont {
    /// Call from App init to register bundled Pretendard .otf / .ttf
    static func registerFonts() {
        let fontNames = [
            "Pretendard-Thin",
            "Pretendard-ExtraLight",
            "Pretendard-Medium",
            "Pretendard-SemiBold",
            "Pretendard-Bold",
            "Pretendard-ExtraBold",
            "Pretendard-Black"
        ]
        for name in fontNames {
            if let url = Bundle.main.url(forResource: name, withExtension: "ttf")
                ?? Bundle.main.url(forResource: name, withExtension: "otf") {
                CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
            }
        }
    }

    // Check whether Pretendard is available at runtime
    static var isPretendardAvailable: Bool {
        UIFont.familyNames.contains(where: { $0.lowercased().contains("pretendard") })
    }
}

// MARK: - Font Extension

extension Font {

    // --- Private helper: Pretendard or rounded system fallback ---

    private static func pretendard(size: CGFloat, weight: Font.Weight) -> Font {
        let weightName: String
        switch weight {
        case .thin:       weightName = "Pretendard-Thin"
        case .ultraLight: weightName = "Pretendard-ExtraLight"
        case .regular:    weightName = "Pretendard-Medium"  // No Regular file; Medium as fallback
        case .medium:     weightName = "Pretendard-Medium"
        case .semibold:   weightName = "Pretendard-SemiBold"
        case .bold:       weightName = "Pretendard-Bold"
        case .heavy:      weightName = "Pretendard-ExtraBold"
        case .black:      weightName = "Pretendard-Black"
        default:          weightName = "Pretendard-Medium"
        }

        if PochakFont.isPretendardAvailable {
            return .custom(weightName, size: size)
        }
        return .system(size: size, weight: weight, design: .rounded)
    }

    // --- Title Scale (tokens.json) ---

    /// 35pt Bold - Hero / splash
    static let pochakTitle01 = pretendard(size: 35, weight: .bold)

    /// 30pt Bold - Section headers
    static let pochakTitle02 = pretendard(size: 30, weight: .bold)

    /// 25pt SemiBold - Page titles
    static let pochakTitle03 = pretendard(size: 25, weight: .semibold)

    /// 20pt SemiBold - Card titles, sub-headers
    static let pochakTitle04 = pretendard(size: 20, weight: .semibold)

    // --- Body Scale ---

    /// 17pt Regular - Primary body text
    static let pochakBody01 = pretendard(size: 17, weight: .regular)

    /// 15pt Regular - Secondary body
    static let pochakBody02 = pretendard(size: 15, weight: .regular)

    /// 13pt Regular - Captions, metadata
    static let pochakBody03 = pretendard(size: 13, weight: .regular)

    /// 11pt Regular - Micro labels, badges
    static let pochakBody04 = pretendard(size: 11, weight: .regular)

    // --- Semantic Aliases ---

    /// Login logo "POCHAK" text
    static let pochakLogo = pretendard(size: 48, weight: .heavy)

    /// Button labels
    static let pochakButton = pretendard(size: 17, weight: .semibold)

    /// Tab bar labels
    static let pochakTab = pretendard(size: 11, weight: .medium)

    /// Navigation bar title
    static let pochakNavTitle = pretendard(size: 17, weight: .bold)

    /// Badge (LIVE / VOD / CLIP)
    static let pochakBadge = pretendard(size: 11, weight: .bold)

    /// Tag chip text
    static let pochakTag = pretendard(size: 13, weight: .medium)

    /// Section "more >" link
    static let pochakSectionLink = pretendard(size: 13, weight: .semibold)
}

// MARK: - View Modifier Shortcuts

extension View {
    func pochakTitleStyle() -> some View {
        self
            .font(.pochakTitle03)
            .foregroundStyle(Color.pochakTextPrimary)
    }

    func pochakBodyStyle() -> some View {
        self
            .font(.pochakBody01)
            .foregroundStyle(Color.pochakTextPrimary)
    }

    func pochakCaptionStyle() -> some View {
        self
            .font(.pochakBody03)
            .foregroundStyle(Color.pochakTextSecondary)
    }
}
