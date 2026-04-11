package com.pochak.android.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

/**
 * Pochak Extended Color Scheme
 * Holds brand-specific colors beyond what Material3 darkColorScheme provides.
 */
data class PochakExtendedColors(
    val card: Color = PochakColors.Card,
    val cardElevated: Color = PochakColors.CardElevated,
    val border: Color = PochakColors.Border,
    val borderLight: Color = PochakColors.BorderLight,
    val divider: Color = PochakColors.Divider,
    val textSecondary: Color = PochakColors.TextSecondary,
    val textTertiary: Color = PochakColors.TextTertiary,
    val textDisabled: Color = PochakColors.TextDisabled,
    val overlay: Color = PochakColors.Overlay,
    val overlayLight: Color = PochakColors.OverlayLight,
    val liveRed: Color = PochakColors.LiveRed,
    val accent: Color = PochakColors.Accent,
    val gnbBackground: Color = PochakColors.GnbBackground,
    val gnbSelected: Color = PochakColors.GnbSelected,
    val gnbUnselected: Color = PochakColors.GnbUnselected,
    val badgeLive: Color = PochakColors.BadgeLive,
    val badgeVod: Color = PochakColors.BadgeVod,
    val badgeClip: Color = PochakColors.BadgeClip,
    val badgeScheduled: Color = PochakColors.BadgeScheduled,
    val kakaoYellow: Color = PochakColors.KakaoYellow,
    val naverGreen: Color = PochakColors.NaverGreen,
)

val LocalPochakColors = staticCompositionLocalOf { PochakExtendedColors() }

private val PochakDarkColorScheme = darkColorScheme(
    primary = PochakColors.Primary,
    onPrimary = PochakColors.TextOnPrimary,
    primaryContainer = PochakColors.PrimaryDark,
    onPrimaryContainer = PochakColors.TextPrimary,
    secondary = PochakColors.PrimaryLight,
    onSecondary = PochakColors.TextOnPrimary,
    secondaryContainer = PochakColors.SurfaceVariant,
    onSecondaryContainer = PochakColors.TextPrimary,
    tertiary = PochakColors.Accent,
    onTertiary = PochakColors.TextOnPrimary,
    error = PochakColors.Error,
    onError = PochakColors.TextPrimary,
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),
    background = PochakColors.Background,
    onBackground = PochakColors.TextPrimary,
    surface = PochakColors.Surface,
    onSurface = PochakColors.TextPrimary,
    surfaceVariant = PochakColors.SurfaceVariant,
    onSurfaceVariant = PochakColors.TextSecondary,
    outline = PochakColors.BorderLight,
    outlineVariant = PochakColors.Border,
    inverseSurface = PochakColors.TextPrimary,
    inverseOnSurface = PochakColors.Background,
    inversePrimary = PochakColors.PrimaryDark,
    surfaceTint = Color.Transparent,
)

@Composable
fun PochakTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = PochakDarkColorScheme
    val extendedColors = PochakExtendedColors()

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = PochakColors.Background.toArgb()
            window.navigationBarColor = PochakColors.GnbBackground.toArgb()
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = false
                isAppearanceLightNavigationBars = false
            }
        }
    }

    CompositionLocalProvider(
        LocalPochakColors provides extendedColors
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = PochakTypography,
            shapes = PochakMaterialShapes,
            content = content,
        )
    }
}

/**
 * Access extended Pochak colors from anywhere in the composition tree.
 */
object PochakTheme {
    val extendedColors: PochakExtendedColors
        @Composable
        get() = LocalPochakColors.current
}
