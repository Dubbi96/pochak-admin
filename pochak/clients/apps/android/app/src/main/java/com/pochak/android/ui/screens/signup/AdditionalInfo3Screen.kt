package com.pochak.android.ui.screens.signup

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// AdditionalInfo3Screen -- 서비스 이용 계기
// ────────────────────────────────────────────────────────

private data class MotivationOption(
    val key: String,
    val text: String,
)

private val MOTIVATION_OPTIONS = listOf(
    MotivationOption("watch_my_game", "내 경기영상을 보고 싶어요 !"),
    MotivationOption("watch_with_family", "자녀와 함께 경기 영상을 시청하고 싶어요 !"),
    MotivationOption("manage_team", "나만의 팀을 만들고 운영하고 싶어요 !"),
)

@Composable
fun AdditionalInfo3Screen(
    onBackClick: () -> Unit = {},
    onSkipClick: () -> Unit = {},
    onCompleteClick: (List<String>) -> Unit = {},
) {
    val selectedMotivations = remember { mutableStateListOf<String>() }

    fun toggleMotivation(key: String) {
        if (selectedMotivations.contains(key)) {
            selectedMotivations.remove(key)
        } else {
            selectedMotivations.add(key)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Service motivation selection screen" },
    ) {
        // ── Top Bar ──
        SignUpTopBar(
            onBackClick = onBackClick,
            trailingContent = {
                Text(
                    text = "건너뛰기",
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.TextSecondary,
                    modifier = Modifier
                        .clickable(onClick = onSkipClick)
                        .padding(end = 8.dp),
                )
            },
        )

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // ── Title ──
            Text(
                text = "서비스 이용 계기",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextPrimary,
            )

            Spacer(modifier = Modifier.height(32.dp))

            // ── Motivation options ──
            MOTIVATION_OPTIONS.forEachIndexed { index, option ->
                MotivationCard(
                    text = option.text,
                    selected = selectedMotivations.contains(option.key),
                    onClick = { toggleMotivation(option.key) },
                )
                if (index < MOTIVATION_OPTIONS.lastIndex) {
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }

        // ── Bottom Bar ──
        AdditionalInfoBottomBar(
            stepLabel = "추가정보 3 / 3",
            buttonText = "가입완료",
            onButtonClick = { onCompleteClick(selectedMotivations.toList()) },
        )
    }
}

@Composable
private fun MotivationCard(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val borderColor = if (selected) PochakColors.Primary else PochakColors.BorderLight
    val bgColor = if (selected) PochakColors.Primary.copy(alpha = 0.08f) else Color.Transparent

    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(PochakShapes.Medium)
            .border(
                width = if (selected) 1.5.dp else 1.dp,
                color = borderColor,
                shape = PochakShapes.Medium,
            )
            .background(bgColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 18.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = text,
            style = PochakTypographyTokens.Body01.copy(
                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
            ),
            color = if (selected) PochakColors.Primary else PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
        )

        if (selected) {
            Spacer(modifier = Modifier.width(12.dp))
            Icon(
                imageVector = Icons.Filled.Check,
                contentDescription = "Selected",
                tint = PochakColors.Primary,
                modifier = Modifier.size(22.dp),
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewAdditionalInfo3Screen() {
    PochakTheme {
        AdditionalInfo3Screen()
    }
}
