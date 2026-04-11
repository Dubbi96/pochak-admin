package com.pochak.android.ui.screens.login

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// LoginScreen
// ────────────────────────────────────────────────────────

@Composable
fun LoginScreen(
    onLogin: (String, String) -> Unit = { _, _ -> },
    onBackClick: () -> Unit = {},
    onSignUp: () -> Unit = {},
    onFindAccount: () -> Unit = {},
    onSnsLogin: (String) -> Unit = {},
) {
    var userId by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var keepLoggedIn by remember { mutableStateOf(true) }

    // Entrance animation
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Login screen" },
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
        ) {
            // ── Top Bar ──
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 8.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = PochakColors.TextPrimary,
                    )
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        text = "한국어",
                        style = PochakTypographyTokens.Body03,
                        color = PochakColors.TextPrimary,
                    )
                    Text(
                        text = "\uD83C\uDF10", // globe emoji
                        style = PochakTypographyTokens.Body02,
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            // ── Logo section ──
            AnimatedVisibility(
                visible = visible,
                enter = fadeIn(tween(600)) + slideInVertically(
                    initialOffsetY = { -40 },
                    animationSpec = tween(600, easing = EaseOutCubic),
                ),
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 24.dp),
                ) {
                    Text(
                        text = "POCHAK",
                        style = PochakTypographyTokens.LogoLarge.copy(
                            brush = Brush.linearGradient(
                                colors = listOf(
                                    Color(0xFF00CC33),
                                    Color(0xFF00FF00),
                                ),
                            ),
                        ),
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Connect you play.",
                        style = PochakTypographyTokens.Body01.copy(
                            fontWeight = FontWeight.Light,
                        ),
                        color = PochakColors.TextPrimary,
                    )
                }
            }

            Spacer(modifier = Modifier.height(60.dp))

            // ── Login form ──
            AnimatedVisibility(
                visible = visible,
                enter = fadeIn(tween(600, delayMillis = 200)) + slideInVertically(
                    initialOffsetY = { 30 },
                    animationSpec = tween(600, delayMillis = 200, easing = EaseOutCubic),
                ),
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 24.dp),
                ) {
                    // ── ID / Password card container ──
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(PochakShapes.Medium)
                            .border(
                                width = 1.dp,
                                color = PochakColors.BorderLight,
                                shape = PochakShapes.Medium,
                            )
                            .background(PochakColors.SurfaceVariant),
                    ) {
                        // ID field
                        TextField(
                            value = userId,
                            onValueChange = { userId = it },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = {
                                Text(
                                    text = "ID",
                                    style = PochakTypographyTokens.Body02,
                                    color = PochakColors.TextTertiary,
                                )
                            },
                            colors = cardTextFieldColors(),
                            textStyle = PochakTypographyTokens.Body02.copy(
                                color = PochakColors.TextPrimary,
                            ),
                            singleLine = true,
                        )

                        // Internal divider
                        HorizontalDivider(
                            color = PochakColors.Border,
                            thickness = 1.dp,
                            modifier = Modifier.padding(horizontal = 16.dp),
                        )

                        // Password field
                        TextField(
                            value = password,
                            onValueChange = { password = it },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = {
                                Text(
                                    text = "Password",
                                    style = PochakTypographyTokens.Body02,
                                    color = PochakColors.TextTertiary,
                                )
                            },
                            visualTransformation = if (passwordVisible) {
                                VisualTransformation.None
                            } else {
                                PasswordVisualTransformation()
                            },
                            trailingIcon = {
                                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                    Icon(
                                        imageVector = if (passwordVisible) Icons.Filled.Visibility
                                        else Icons.Filled.VisibilityOff,
                                        contentDescription = if (passwordVisible) "Hide password"
                                        else "Show password",
                                        tint = PochakColors.TextTertiary,
                                    )
                                }
                            },
                            colors = cardTextFieldColors(),
                            textStyle = PochakTypographyTokens.Body02.copy(
                                color = PochakColors.TextPrimary,
                            ),
                            singleLine = true,
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // ── Login button ──
                    Button(
                        onClick = { onLogin(userId, password) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        enabled = userId.isNotBlank() && password.isNotBlank(),
                        shape = PochakShapes.Button,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PochakColors.Primary,
                            contentColor = PochakColors.TextOnPrimary,
                            disabledContainerColor = PochakColors.TextDisabled,
                            disabledContentColor = PochakColors.TextTertiary,
                        ),
                    ) {
                        Text(
                            text = "로그인",
                            style = PochakTypographyTokens.ButtonLarge,
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // ── Keep logged in / Find / Sign up row ──
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        // Keep logged in with green check
                        Row(
                            modifier = Modifier.clickable { keepLoggedIn = !keepLoggedIn },
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            Icon(
                                imageVector = if (keepLoggedIn) Icons.Filled.CheckCircle
                                else Icons.Outlined.CheckCircle,
                                contentDescription = "Keep logged in",
                                tint = if (keepLoggedIn) PochakColors.Primary
                                else PochakColors.TextTertiary,
                                modifier = Modifier.size(20.dp),
                            )
                            Text(
                                text = "로그인유지",
                                style = PochakTypographyTokens.Body03,
                                color = if (keepLoggedIn) PochakColors.Primary
                                else PochakColors.TextSecondary,
                            )
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text(
                                text = "아이디/비밀번호 찾기",
                                style = PochakTypographyTokens.Body03,
                                color = PochakColors.TextSecondary,
                                modifier = Modifier.clickable(onClick = onFindAccount),
                            )
                            Text(
                                text = "회원가입",
                                style = PochakTypographyTokens.Body03,
                                color = PochakColors.TextPrimary,
                                modifier = Modifier.clickable(onClick = onSignUp),
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(40.dp))

                    // ── SNS Login Buttons (4 in a row) ──
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        // Kakao
                        SnsLoginPill(
                            label = "카카오",
                            iconText = "\uD83D\uDCAC",
                            backgroundColor = PochakColors.KakaoYellow,
                            contentColor = PochakColors.KakaoBrown,
                            onClick = { onSnsLogin("kakao") },
                            accessibilityLabel = "Sign in with Kakao",
                            modifier = Modifier.weight(1f),
                        )

                        // Naver
                        SnsLoginPill(
                            label = "N",
                            iconText = null,
                            backgroundColor = PochakColors.NaverGreen,
                            contentColor = Color.White,
                            onClick = { onSnsLogin("naver") },
                            accessibilityLabel = "Sign in with Naver",
                            modifier = Modifier.weight(1f),
                            useBoldLabel = true,
                        )

                        // Google
                        SnsLoginPill(
                            label = "G",
                            iconText = null,
                            backgroundColor = Color.Transparent,
                            contentColor = Color.White,
                            onClick = { onSnsLogin("google") },
                            accessibilityLabel = "Sign in with Google",
                            modifier = Modifier.weight(1f),
                            borderColor = PochakColors.BorderLight,
                            useBoldLabel = true,
                        )

                        // Apple
                        SnsLoginPill(
                            label = "\uF8FF",
                            iconText = null,
                            backgroundColor = PochakColors.AppleBlack,
                            contentColor = Color.White,
                            onClick = { onSnsLogin("apple") },
                            accessibilityLabel = "Sign in with Apple",
                            modifier = Modifier.weight(1f),
                            borderColor = PochakColors.BorderLight,
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))
        }
    }
}

// ────────────────────────────────────────────────────────
// Card TextField Colors (transparent, no underline)
// ────────────────────────────────────────────────────────

@Composable
private fun cardTextFieldColors() = TextFieldDefaults.colors(
    focusedTextColor = PochakColors.TextPrimary,
    unfocusedTextColor = PochakColors.TextPrimary,
    cursorColor = PochakColors.Primary,
    focusedContainerColor = Color.Transparent,
    unfocusedContainerColor = Color.Transparent,
    disabledContainerColor = Color.Transparent,
    focusedIndicatorColor = Color.Transparent,
    unfocusedIndicatorColor = Color.Transparent,
    disabledIndicatorColor = Color.Transparent,
)

// ────────────────────────────────────────────────────────
// SNS Login Pill (rounded rectangle, compact)
// ────────────────────────────────────────────────────────

@Composable
private fun SnsLoginPill(
    label: String,
    iconText: String?,
    backgroundColor: Color,
    contentColor: Color,
    onClick: () -> Unit,
    accessibilityLabel: String,
    modifier: Modifier = Modifier,
    borderColor: Color? = null,
    useBoldLabel: Boolean = false,
) {
    val shape = PochakShapes.SnsButton

    Box(
        modifier = modifier
            .height(48.dp)
            .clip(shape)
            .then(
                if (borderColor != null) {
                    Modifier.border(width = 1.dp, color = borderColor, shape = shape)
                } else {
                    Modifier
                }
            )
            .background(backgroundColor)
            .clickable(onClick = onClick)
            .semantics { contentDescription = accessibilityLabel },
        contentAlignment = Alignment.Center,
    ) {
        if (iconText != null) {
            Text(
                text = iconText,
                fontSize = 20.sp,
                color = contentColor,
            )
        } else {
            Text(
                text = label,
                style = PochakTypographyTokens.Body01.copy(
                    fontWeight = if (useBoldLabel) FontWeight.Bold else FontWeight.Normal,
                    fontSize = 18.sp,
                ),
                color = contentColor,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewLoginScreen() {
    PochakTheme {
        LoginScreen()
    }
}
