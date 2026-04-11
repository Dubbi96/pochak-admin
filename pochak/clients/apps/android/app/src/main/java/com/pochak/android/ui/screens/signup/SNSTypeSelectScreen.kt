package com.pochak.android.ui.screens.signup

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// SNSTypeSelectScreen
// ────────────────────────────────────────────────────────

enum class AgeGroup {
    UNDER_14,
    OVER_14,
}

@Composable
fun SNSTypeSelectScreen(
    snsType: String = "카카오",
    onAgeGroupSelected: (AgeGroup) -> Unit = {},
    onForeignerClick: () -> Unit = {},
) {
    var selectedAge by remember { mutableStateOf<AgeGroup?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "SNS type select screen" },
    ) {
        Spacer(
            modifier = Modifier
                .statusBarsPadding()
                .height(48.dp),
        )

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            // ── Title ──
            Text(
                text = "POCHAK 회원가입",
                style = PochakTypographyTokens.Title02,
                color = PochakColors.TextPrimary,
                textAlign = TextAlign.Center,
            )

            Spacer(modifier = Modifier.height(16.dp))

            // ── SNS Badge ──
            Box(
                modifier = Modifier
                    .background(
                        color = PochakColors.Primary,
                        shape = PochakShapes.Full,
                    )
                    .padding(horizontal = 20.dp, vertical = 8.dp),
            ) {
                Text(
                    text = "$snsType 회원가입",
                    style = PochakTypographyTokens.ButtonMedium,
                    color = PochakColors.TextOnPrimary,
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            // ── Age selection boxes ──
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                // Under 14
                AgeSelectionCard(
                    title = "만 14세 미만",
                    selected = selectedAge == AgeGroup.UNDER_14,
                    onClick = {
                        selectedAge = AgeGroup.UNDER_14
                        onAgeGroupSelected(AgeGroup.UNDER_14)
                    },
                    modifier = Modifier.weight(1f),
                )

                // Over 14
                AgeSelectionCard(
                    title = "만 14세 이상",
                    selected = selectedAge == AgeGroup.OVER_14,
                    onClick = {
                        selectedAge = AgeGroup.OVER_14
                        onAgeGroupSelected(AgeGroup.OVER_14)
                    },
                    modifier = Modifier.weight(1f),
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            // ── Foreigner link ──
            Text(
                text = "해외에서 응원해요! Foreigner",
                style = PochakTypographyTokens.Body02.copy(
                    textDecoration = TextDecoration.Underline,
                ),
                color = PochakColors.TextSecondary,
                modifier = Modifier
                    .clickable(onClick = onForeignerClick)
                    .padding(vertical = 16.dp),
                textAlign = TextAlign.Center,
            )

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun AgeSelectionCard(
    title: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val borderColor = if (selected) PochakColors.Primary else PochakColors.BorderLight
    val backgroundColor = if (selected) PochakColors.SurfaceVariant else PochakColors.Background

    Box(
        modifier = modifier
            .aspectRatio(1f)
            .clip(PochakShapes.Large)
            .border(
                width = if (selected) 2.dp else 1.dp,
                color = borderColor,
                shape = PochakShapes.Large,
            )
            .background(backgroundColor)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = title,
            style = PochakTypographyTokens.Body01.copy(
                fontWeight = FontWeight.SemiBold,
            ),
            color = if (selected) PochakColors.Primary else PochakColors.TextPrimary,
            textAlign = TextAlign.Center,
        )
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewSNSTypeSelectScreen() {
    PochakTheme {
        SNSTypeSelectScreen(snsType = "카카오")
    }
}
