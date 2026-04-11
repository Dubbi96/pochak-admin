package com.pochak.android.ui.screens.signup

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// SignUpCompleteScreen
// ────────────────────────────────────────────────────────

@Composable
fun SignUpCompleteScreen(
    onSubscribe: () -> Unit = {},
    onSkip: () -> Unit = {},
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Sign up complete screen" },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Spacer(modifier = Modifier.weight(1f))

        // ── Title ──
        Text(
            text = "회원가입 완료",
            style = PochakTypographyTokens.Title02,
            color = PochakColors.TextPrimary,
            textAlign = TextAlign.Center,
        )

        Spacer(modifier = Modifier.height(48.dp))

        // ── Subscribe CTA button with green gradient ──
        Button(
            onClick = onSubscribe,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp)
                .height(56.dp),
            shape = PochakShapes.Button,
            colors = ButtonDefaults.buttonColors(
                containerColor = androidx.compose.ui.graphics.Color.Transparent,
            ),
            contentPadding = PaddingValues(),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(PochakColors.Primary, PochakColors.Accent),
                            start = Offset.Zero,
                            end = Offset(Float.POSITIVE_INFINITY, 0f),
                        ),
                        shape = PochakShapes.Button,
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "대가족 무제한 시청권! 지금 구독하기",
                    style = PochakTypographyTokens.ButtonLarge.copy(
                        fontWeight = FontWeight.Bold,
                    ),
                    color = PochakColors.TextOnPrimary,
                    textAlign = TextAlign.Center,
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // ── Skip link ──
        Text(
            text = "다음에 할게요.",
            style = PochakTypographyTokens.Body02,
            color = PochakColors.TextSecondary,
            modifier = Modifier
                .clickable(onClick = onSkip)
                .padding(vertical = 8.dp, horizontal = 16.dp),
        )

        Spacer(modifier = Modifier.weight(1f))
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewSignUpCompleteScreen() {
    PochakTheme {
        SignUpCompleteScreen()
    }
}
