package com.pochak.android.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.pochak.android.R

/**
 * Pochak Typography System
 *
 * Uses Pretendard font family with weight scale.
 * Falls back to system default sans-serif when font resources are not available.
 */

val PretendardFontFamily = FontFamily(
    Font(R.font.pretendard_thin, FontWeight.Thin),           // 100
    Font(R.font.pretendard_extralight, FontWeight.ExtraLight),// 200
    Font(R.font.pretendard_medium, FontWeight.Normal),        // 400 (Medium as fallback, no Regular file)
    Font(R.font.pretendard_medium, FontWeight.Medium),        // 500
    Font(R.font.pretendard_semibold, FontWeight.SemiBold),    // 600
    Font(R.font.pretendard_bold, FontWeight.Bold),            // 700
    Font(R.font.pretendard_extrabold, FontWeight.ExtraBold),  // 800
    Font(R.font.pretendard_black, FontWeight.Black),          // 900
)

/**
 * Extended typography scale matching design tokens.
 * title01=35sp, title02=30sp, title03=25sp, title04=20sp
 * body01=17sp, body02=15sp, body03=13sp, body04=11sp
 */
object PochakTypographyTokens {
    val Title01 = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 35.sp,
        lineHeight = 40.sp,
    )
    val Title02 = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 30.sp,
        lineHeight = 40.sp,
    )
    val Title03 = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 25.sp,
        lineHeight = 30.sp,
    )
    val Title04 = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        lineHeight = 30.sp,
    )
    val Body01 = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 17.sp,
        lineHeight = 24.sp,
    )
    val Body02 = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 15.sp,
        lineHeight = 20.sp,
    )
    val Body03 = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        lineHeight = 18.sp,
    )
    val Body04 = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 11.sp,
        lineHeight = 16.sp,
    )
    val LogoLarge = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.ExtraBold,
        fontSize = 48.sp,
        lineHeight = 56.sp,
    )
    val ButtonLarge = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 17.sp,
        lineHeight = 24.sp,
    )
    val ButtonMedium = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 15.sp,
        lineHeight = 20.sp,
    )
    val Caption = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
    )
    val Overline = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 10.sp,
        lineHeight = 14.sp,
        letterSpacing = 1.sp,
    )
}

val PochakTypography = Typography(
    displayLarge = PochakTypographyTokens.Title01,
    displayMedium = PochakTypographyTokens.Title02,
    displaySmall = PochakTypographyTokens.Title03,
    headlineLarge = PochakTypographyTokens.Title03,
    headlineMedium = PochakTypographyTokens.Title04,
    headlineSmall = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 18.sp,
        lineHeight = 26.sp,
    ),
    titleLarge = PochakTypographyTokens.Title04,
    titleMedium = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp,
    ),
    titleSmall = TextStyle(
        fontFamily = PretendardFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
    bodyLarge = PochakTypographyTokens.Body01,
    bodyMedium = PochakTypographyTokens.Body02,
    bodySmall = PochakTypographyTokens.Body03,
    labelLarge = PochakTypographyTokens.ButtonLarge,
    labelMedium = PochakTypographyTokens.ButtonMedium,
    labelSmall = PochakTypographyTokens.Caption,
)
