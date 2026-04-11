package com.pochak.android.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Pochak Brand Color System
 * Based on design tokens and Figma specifications.
 */
object PochakColors {

    // ── Primary brand ──
    val Primary = Color(0xFF00CC33)
    val PrimaryLight = Color(0xFF69F0AE)
    val PrimaryDark = Color(0xFF00A844)
    val Accent = Color(0xFF00FF00)

    // ── Semantic ──
    val Error = Color(0xFFE51728)
    val LiveRed = Color(0xFFFF1744)
    val Warning = Color(0xFFFFD740)
    val Info = Color(0xFF6699FF)
    val Success = Color(0xFF00CC33)

    // ── Surfaces & backgrounds ──
    val Background = Color(0xFF121212)
    val BackgroundVariant = Color(0xFF1A1A1A)
    val Surface = Color(0xFF1E1E1E)
    val SurfaceVariant = Color(0xFF262626)
    val Card = Color(0xFF262626)
    val CardElevated = Color(0xFF2C2C2C)

    // ── Borders & dividers ──
    val Border = Color(0xFF2A2A2A)
    val BorderLight = Color(0xFF4D4D4D)
    val Divider = Color(0x1FFFFFFF) // 12% white

    // ── Text ──
    val TextPrimary = Color(0xFFFFFFFF)
    val TextSecondary = Color(0xFFA6A6A6)
    val TextTertiary = Color(0xFF606060)
    val TextOnPrimary = Color(0xFF000000)
    val TextDisabled = Color(0xFF404040)

    // ── Overlay ──
    val Overlay = Color(0x99000000) // 60% black
    val OverlayLight = Color(0x33000000) // 20% black
    val GradientStart = Color(0xFF1A1A1A)
    val GradientEnd = Color(0xFF121212)

    // ── SNS Brand ──
    val KakaoYellow = Color(0xFFFEE500)
    val KakaoBrown = Color(0xFF3C1E1E)
    val NaverGreen = Color(0xFF03C75A)
    val GoogleWhite = Color(0xFFFFFFFF)
    val AppleBlack = Color(0xFF000000)

    // ── GNB ──
    val GnbBackground = Color(0xFF1E1E1E)
    val GnbSelected = Primary
    val GnbUnselected = Color(0xFF808080)
    val GnbDotIndicator = Primary

    // ── Badge backgrounds ──
    val BadgeLive = LiveRed
    val BadgeVod = Primary
    val BadgeClip = Color(0xFFFFC107)
    val BadgeScheduled = Color(0xFF757575)
    val BadgeFree = Color(0xFFB0BEC5)
}
