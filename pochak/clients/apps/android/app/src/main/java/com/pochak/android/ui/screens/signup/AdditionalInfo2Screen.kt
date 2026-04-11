package com.pochak.android.ui.screens.signup

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
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
import com.pochak.android.ui.components.PochakTextField
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// AdditionalInfo2Screen -- 관심종목 선택
// ────────────────────────────────────────────────────────

private val PRESET_SPORTS = listOf(
    "축구", "야구", "배구", "핸드볼", "농구", "기타",
)

private const val MAX_SPORTS = 3

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AdditionalInfo2Screen(
    onBackClick: () -> Unit = {},
    onSkipClick: () -> Unit = {},
    onNextClick: (List<String>) -> Unit = {},
) {
    val selectedSports = remember { mutableStateListOf<String>() }
    var customSport by remember { mutableStateOf("") }

    fun addSport(sport: String) {
        val trimmed = sport.trim()
        if (trimmed.isNotBlank() && !selectedSports.contains(trimmed) && selectedSports.size < MAX_SPORTS) {
            selectedSports.add(trimmed)
        }
    }

    fun removeSport(sport: String) {
        selectedSports.remove(sport)
    }

    fun togglePreset(sport: String) {
        if (selectedSports.contains(sport)) {
            removeSport(sport)
        } else {
            addSport(sport)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Interest sport selection screen" },
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
                .padding(horizontal = 24.dp),
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // ── Title ──
            Text(
                text = "관심종목 선택",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextPrimary,
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "최대 ${MAX_SPORTS}개 선택 가능",
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextSecondary,
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Preset sport chips ──
            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                PRESET_SPORTS.forEach { sport ->
                    SportChip(
                        text = "#$sport",
                        selected = selectedSports.contains(sport),
                        enabled = selectedSports.contains(sport) || selectedSports.size < MAX_SPORTS,
                        onClick = { togglePreset(sport) },
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Custom sport input ──
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                PochakTextField(
                    value = customSport,
                    onValueChange = { customSport = it },
                    placeholder = "종목 직접입력",
                    modifier = Modifier.weight(1f),
                )
                Button(
                    onClick = {
                        addSport(customSport)
                        customSport = ""
                    },
                    enabled = customSport.isNotBlank() && selectedSports.size < MAX_SPORTS,
                    shape = PochakShapes.Button,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = PochakColors.Primary,
                        contentColor = PochakColors.TextOnPrimary,
                        disabledContainerColor = PochakColors.TextDisabled,
                        disabledContentColor = PochakColors.TextTertiary,
                    ),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
                ) {
                    Text(
                        text = "추가",
                        style = PochakTypographyTokens.ButtonMedium,
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Selected sports list ──
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(
                    items = selectedSports.toList(),
                    key = { it },
                ) { sport ->
                    SelectedSportItem(
                        text = sport,
                        onRemove = { removeSport(sport) },
                    )
                }
            }
        }

        // ── Bottom Bar ──
        AdditionalInfoBottomBar(
            stepLabel = "추가정보 2 / 3",
            buttonText = "다음",
            onButtonClick = { onNextClick(selectedSports.toList()) },
        )
    }
}

@Composable
private fun SportChip(
    text: String,
    selected: Boolean,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val borderColor = when {
        selected -> PochakColors.Primary
        !enabled -> PochakColors.TextDisabled
        else -> PochakColors.BorderLight
    }
    val textColor = when {
        selected -> PochakColors.Primary
        !enabled -> PochakColors.TextDisabled
        else -> PochakColors.TextPrimary
    }
    val bgColor = if (selected) {
        PochakColors.Primary.copy(alpha = 0.1f)
    } else {
        Color.Transparent
    }

    Box(
        modifier = modifier
            .clip(PochakShapes.Chip)
            .border(
                width = 1.dp,
                color = borderColor,
                shape = PochakShapes.Chip,
            )
            .background(bgColor)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 10.dp),
    ) {
        Text(
            text = text,
            style = PochakTypographyTokens.Body02.copy(
                fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
            ),
            color = textColor,
        )
    }
}

@Composable
private fun SelectedSportItem(
    text: String,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = 1.dp,
                color = PochakColors.Border,
                shape = PochakShapes.Base,
            )
            .padding(horizontal = 12.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "#",
            style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
            color = PochakColors.Primary,
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = text,
            style = PochakTypographyTokens.Body02,
            color = PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
        )
        IconButton(
            onClick = onRemove,
            modifier = Modifier.size(24.dp),
        ) {
            Icon(
                imageVector = Icons.Filled.Close,
                contentDescription = "Remove $text",
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(16.dp),
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewAdditionalInfo2Screen() {
    PochakTheme {
        AdditionalInfo2Screen()
    }
}
