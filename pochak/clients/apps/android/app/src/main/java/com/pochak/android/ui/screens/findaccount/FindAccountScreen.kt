package com.pochak.android.ui.screens.findaccount

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Info
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
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.components.PochakTextField
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// FindAccountScreen
// ────────────────────────────────────────────────────────

@Composable
fun FindAccountScreen(
    onBackClick: () -> Unit = {},
    onLoginClick: () -> Unit = {},
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .statusBarsPadding()
            .semantics { contentDescription = "Find account screen" },
    ) {
        // ── Top bar ──
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = PochakColors.TextPrimary,
                )
            }
        }

        // ── Title ──
        Text(
            text = "아이디/비밀번호 찾기",
            style = PochakTypographyTokens.Title03,
            color = PochakColors.TextPrimary,
            modifier = Modifier.padding(horizontal = 24.dp),
        )

        Spacer(modifier = Modifier.height(24.dp))

        // ── Tab row ──
        FindAccountTabRow(
            selectedTab = selectedTab,
            onTabSelected = { selectedTab = it },
        )

        Spacer(modifier = Modifier.height(24.dp))

        // ── Tab content ──
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
        ) {
            when (selectedTab) {
                0 -> FindIdTabContent()
                1 -> ResetPasswordTabContent()
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Tab Row
// ────────────────────────────────────────────────────────

@Composable
private fun FindAccountTabRow(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
) {
    val tabs = listOf("아이디 찾기", "비밀번호 재설정")

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
    ) {
        tabs.forEachIndexed { index, title ->
            val isSelected = selectedTab == index
            val indicatorColor by animateColorAsState(
                targetValue = if (isSelected) PochakColors.Primary else Color.Transparent,
                label = "tab_indicator",
            )
            val textColor by animateColorAsState(
                targetValue = if (isSelected) PochakColors.TextPrimary else PochakColors.TextTertiary,
                label = "tab_text",
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .clickable { onTabSelected(index) },
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = title,
                    style = PochakTypographyTokens.ButtonMedium,
                    color = textColor,
                    modifier = Modifier.padding(vertical = 12.dp),
                )
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(2.dp)
                        .background(indicatorColor),
                )
            }
        }
    }

    // Full-width divider beneath tabs
    HorizontalDivider(
        color = PochakColors.Border,
        thickness = 1.dp,
    )
}

// ────────────────────────────────────────────────────────
// Find ID Tab
// ────────────────────────────────────────────────────────

@Composable
private fun FindIdTabContent() {
    var findMethod by remember { mutableIntStateOf(0) } // 0=email, 1=phone
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    // ── Toggle pills ──
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        TogglePill(
            text = "이메일로 찾기",
            isActive = findMethod == 0,
            onClick = { findMethod = 0 },
            modifier = Modifier.weight(1f),
        )
        TogglePill(
            text = "본인인증 찾기",
            isActive = findMethod == 1,
            onClick = { findMethod = 1 },
            modifier = Modifier.weight(1f),
        )
    }

    Spacer(modifier = Modifier.height(24.dp))

    when (findMethod) {
        0 -> {
            // Email input
            PochakTextField(
                value = email,
                onValueChange = { email = it },
                placeholder = "이메일 주소 입력",
            )
        }
        1 -> {
            // Phone verification
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                PochakTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    placeholder = "연락처 본인 인증",
                    modifier = Modifier.weight(1f),
                )
                Text(
                    text = "인증하기",
                    style = PochakTypographyTokens.ButtonMedium,
                    color = PochakColors.Primary,
                    modifier = Modifier.clickable { /* TODO: verify */ },
                )
            }
        }
    }

    Spacer(modifier = Modifier.height(32.dp))

    PochakButton(
        text = "조회하기",
        onClick = { /* TODO */ },
        enabled = when (findMethod) {
            0 -> email.isNotBlank()
            1 -> phone.isNotBlank()
            else -> false
        },
    )
}

// ────────────────────────────────────────────────────────
// Reset Password Tab
// ────────────────────────────────────────────────────────

@Composable
private fun ResetPasswordTabContent() {
    var userId by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    PochakTextField(
        value = userId,
        onValueChange = { userId = it },
        placeholder = "아이디 입력",
    )

    Spacer(modifier = Modifier.height(12.dp))

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        PochakTextField(
            value = phone,
            onValueChange = { phone = it },
            placeholder = "연락처 본인 인증",
            modifier = Modifier.weight(1f),
        )
        Text(
            text = "인증하기",
            style = PochakTypographyTokens.ButtonMedium,
            color = PochakColors.Primary,
            modifier = Modifier.clickable { /* TODO: verify */ },
        )
    }

    Spacer(modifier = Modifier.height(32.dp))

    PochakButton(
        text = "비밀번호 재설정",
        onClick = { /* TODO */ },
        enabled = userId.isNotBlank() && phone.isNotBlank(),
    )
}

// ────────────────────────────────────────────────────────
// Toggle Pill
// ────────────────────────────────────────────────────────

@Composable
private fun TogglePill(
    text: String,
    isActive: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val bgColor by animateColorAsState(
        targetValue = if (isActive) PochakColors.Primary else Color.Transparent,
        label = "pill_bg",
    )
    val textColor by animateColorAsState(
        targetValue = if (isActive) PochakColors.TextOnPrimary else PochakColors.TextSecondary,
        label = "pill_text",
    )
    val borderColor by animateColorAsState(
        targetValue = if (isActive) PochakColors.Primary else PochakColors.BorderLight,
        label = "pill_border",
    )

    Box(
        modifier = modifier
            .clip(PochakShapes.Full)
            .background(bgColor)
            .border(
                width = 1.dp,
                color = borderColor,
                shape = PochakShapes.Full,
            )
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            style = PochakTypographyTokens.ButtonMedium,
            color = textColor,
        )
    }
}

// ────────────────────────────────────────────────────────
// English version composable (for foreigner flow)
// ────────────────────────────────────────────────────────

@Composable
fun FindAccountScreenEnglish(
    onBackClick: () -> Unit = {},
    onLoginClick: () -> Unit = {},
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .statusBarsPadding()
            .semantics { contentDescription = "Find account screen (English)" },
    ) {
        // ── Top bar ──
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = PochakColors.TextPrimary,
                )
            }
        }

        // ── Title ──
        Text(
            text = "Find ID/Password.",
            style = PochakTypographyTokens.Title03,
            color = PochakColors.TextPrimary,
            modifier = Modifier.padding(horizontal = 24.dp),
        )

        Spacer(modifier = Modifier.height(8.dp))

        // ── Info subtitle ──
        Row(
            modifier = Modifier.padding(horizontal = 24.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Icon(
                imageVector = Icons.Outlined.Info,
                contentDescription = null,
                tint = PochakColors.TextSecondary,
                modifier = Modifier.size(16.dp),
            )
            Text(
                text = "Enter the email you verified during sign-up.",
                style = PochakTypographyTokens.Body03,
                color = PochakColors.TextSecondary,
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Tab row ──
        FindAccountTabRowEnglish(
            selectedTab = selectedTab,
            onTabSelected = { selectedTab = it },
        )

        Spacer(modifier = Modifier.height(24.dp))

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
        ) {
            when (selectedTab) {
                0 -> FindIdTabEnglish()
                1 -> ResetPasswordTabEnglish()
            }
        }
    }
}

@Composable
private fun FindAccountTabRowEnglish(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
) {
    val tabs = listOf("Find ID", "Reset password")

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
    ) {
        tabs.forEachIndexed { index, title ->
            val isSelected = selectedTab == index
            val indicatorColor by animateColorAsState(
                targetValue = if (isSelected) PochakColors.Primary else Color.Transparent,
                label = "tab_indicator_en",
            )
            val textColor by animateColorAsState(
                targetValue = if (isSelected) PochakColors.TextPrimary else PochakColors.TextTertiary,
                label = "tab_text_en",
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .clickable { onTabSelected(index) },
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = title,
                    style = PochakTypographyTokens.ButtonMedium,
                    color = textColor,
                    modifier = Modifier.padding(vertical = 12.dp),
                )
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(2.dp)
                        .background(indicatorColor),
                )
            }
        }
    }

    HorizontalDivider(color = PochakColors.Border, thickness = 1.dp)
}

@Composable
private fun FindIdTabEnglish() {
    var email by remember { mutableStateOf("") }

    PochakTextField(
        value = email,
        onValueChange = { email = it },
        placeholder = "Email address",
    )

    Spacer(modifier = Modifier.height(32.dp))

    PochakButton(
        text = "Find",
        onClick = { /* TODO */ },
        enabled = email.isNotBlank(),
    )
}

@Composable
private fun ResetPasswordTabEnglish() {
    var userId by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }

    PochakTextField(
        value = userId,
        onValueChange = { userId = it },
        placeholder = "ID",
    )

    Spacer(modifier = Modifier.height(12.dp))

    PochakTextField(
        value = email,
        onValueChange = { email = it },
        placeholder = "Email address",
    )

    Spacer(modifier = Modifier.height(32.dp))

    PochakButton(
        text = "Reset",
        onClick = { /* TODO */ },
        enabled = userId.isNotBlank() && email.isNotBlank(),
    )
}

// ────────────────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewFindAccountScreen() {
    PochakTheme {
        FindAccountScreen()
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewFindAccountScreenEnglish() {
    PochakTheme {
        FindAccountScreenEnglish()
    }
}
