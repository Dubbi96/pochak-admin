package com.pochak.android.ui.screens.intro

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.theme.*

/**
 * Country / language selection screen shown during first launch.
 *
 * - Displays the POCHAK logo prominently in the center
 * - Dropdown for country selection (default: "대한민국")
 * - Green "시작하기" (Start) CTA
 * - "로그인하기" link for returning users
 */

private val countries = listOf(
    "대한민국",
    "United States",
    "日本",
    "中国",
)

@Composable
fun CountrySelectScreen(
    onStart: (country: String) -> Unit,
    onLoginClick: () -> Unit,
) {
    var selectedCountry by remember { mutableStateOf(countries.first()) }
    var dropdownExpanded by remember { mutableStateOf(false) }

    // Entrance animation
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(PochakColors.BackgroundVariant, PochakColors.Background),
                    center = Offset(0.5f, 0.35f),
                    radius = 1400f,
                )
            )
            .semantics { contentDescription = "Country selection screen" },
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(modifier = Modifier.weight(1f))

            // ── Logo ──
            AnimatedVisibility(
                visible = visible,
                enter = fadeIn(tween(700)) + scaleIn(
                    initialScale = 0.85f,
                    animationSpec = tween(700, easing = EaseOutCubic),
                ),
            ) {
                Text(
                    text = "POCHAK",
                    style = PochakTypographyTokens.LogoLarge.copy(
                        brush = Brush.linearGradient(
                            colors = listOf(PochakColors.Primary, PochakColors.Accent),
                        ),
                    ),
                    textAlign = TextAlign.Center,
                )
            }

            Spacer(modifier = Modifier.height(40.dp))

            // ── Description ──
            AnimatedVisibility(
                visible = visible,
                enter = fadeIn(tween(600, delayMillis = 200)),
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "회원님의 서비스 국가를 선택해주세요!",
                        style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Medium),
                        color = PochakColors.TextPrimary,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "(언어 설정에 활용돼요)",
                        style = PochakTypographyTokens.Body03,
                        color = PochakColors.TextSecondary,
                        textAlign = TextAlign.Center,
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // ── Country Dropdown ──
            AnimatedVisibility(
                visible = visible,
                enter = fadeIn(tween(600, delayMillis = 350)),
            ) {
                Box {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(PochakShapes.Medium)
                            .border(
                                width = 1.dp,
                                color = PochakColors.BorderLight,
                                shape = PochakShapes.Medium,
                            )
                            .background(PochakColors.Surface)
                            .clickable { dropdownExpanded = !dropdownExpanded }
                            .padding(horizontal = 16.dp, vertical = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = selectedCountry,
                            style = PochakTypographyTokens.Body01,
                            color = PochakColors.TextPrimary,
                        )
                        Icon(
                            imageVector = if (dropdownExpanded) {
                                Icons.Filled.KeyboardArrowUp
                            } else {
                                Icons.Filled.KeyboardArrowDown
                            },
                            contentDescription = "Toggle country list",
                            tint = PochakColors.TextSecondary,
                        )
                    }

                    DropdownMenu(
                        expanded = dropdownExpanded,
                        onDismissRequest = { dropdownExpanded = false },
                        modifier = Modifier
                            .fillMaxWidth(0.85f)
                            .background(PochakColors.Surface),
                    ) {
                        countries.forEach { country ->
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        text = country,
                                        style = PochakTypographyTokens.Body02,
                                        color = if (country == selectedCountry) {
                                            PochakColors.Primary
                                        } else {
                                            PochakColors.TextPrimary
                                        },
                                    )
                                },
                                onClick = {
                                    selectedCountry = country
                                    dropdownExpanded = false
                                },
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // ── Bottom CTA ──
            AnimatedVisibility(
                visible = visible,
                enter = fadeIn(tween(600, delayMillis = 500)) + slideInVertically(
                    initialOffsetY = { 40 },
                    animationSpec = tween(600, delayMillis = 500, easing = EaseOutCubic),
                ),
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    PochakButton(
                        text = "시작하기",
                        onClick = { onStart(selectedCountry) },
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "로그인하기",
                        style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Medium),
                        color = PochakColors.TextSecondary,
                        modifier = Modifier
                            .clickable(onClick = onLoginClick)
                            .padding(vertical = 8.dp),
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

// ── Preview ──

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewCountrySelectScreen() {
    PochakTheme {
        CountrySelectScreen(
            onStart = {},
            onLoginClick = {},
        )
    }
}
