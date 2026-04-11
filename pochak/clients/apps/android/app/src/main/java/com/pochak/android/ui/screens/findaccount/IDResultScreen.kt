package com.pochak.android.ui.screens.findaccount

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// Data model for found account
// ────────────────────────────────────────────────────────

data class FoundAccount(
    val userId: String,
    val email: String,
)

// ────────────────────────────────────────────────────────
// IDResultScreen
// ────────────────────────────────────────────────────────

@Composable
fun IDResultScreen(
    onBackClick: () -> Unit = {},
    onSelectAccount: (String) -> Unit = {},
    accounts: List<FoundAccount> = sampleAccounts,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .statusBarsPadding()
            .semantics { contentDescription = "ID result screen" },
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
            text = "아이디 조회 결과",
            style = PochakTypographyTokens.Title03,
            color = PochakColors.TextPrimary,
            modifier = Modifier.padding(horizontal = 24.dp),
        )

        Spacer(modifier = Modifier.height(24.dp))

        // ── Account list ──
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(0.dp),
        ) {
            items(accounts) { account ->
                AccountRow(
                    account = account,
                    onClick = { onSelectAccount(account.userId) },
                )
                HorizontalDivider(
                    color = PochakColors.Border,
                    thickness = 1.dp,
                    modifier = Modifier.padding(vertical = 0.dp),
                )
            }
        }

        // ── Bottom: "메인으로" button ──
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 24.dp),
            contentAlignment = Alignment.Center,
        ) {
            Box(
                modifier = Modifier
                    .clip(PochakShapes.Full)
                    .background(PochakColors.SurfaceVariant)
                    .clickable(onClick = onBackClick)
                    .padding(horizontal = 32.dp, vertical = 12.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "메인으로",
                    style = PochakTypographyTokens.ButtonMedium,
                    color = PochakColors.TextPrimary,
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Account Row
// ────────────────────────────────────────────────────────

@Composable
private fun AccountRow(
    account: FoundAccount,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Green Pochak icon circle
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(PochakColors.Primary),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "P",
                style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextOnPrimary,
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Account info
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = account.userId,
                style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = account.email,
                style = PochakTypographyTokens.Body03,
                color = PochakColors.TextSecondary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }

        // Chevron right
        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = "Select account",
            tint = PochakColors.TextTertiary,
            modifier = Modifier.size(24.dp),
        )
    }
}

// ────────────────────────────────────────────────────────
// Sample data
// ────────────────────────────────────────────────────────

private val sampleAccounts = listOf(
    FoundAccount("pochak2024", "kimpochak@hogak.co.kr"),
    FoundAccount("pochak2025", "parkpochak@hogak.co.kr"),
)

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewIDResultScreen() {
    PochakTheme {
        IDResultScreen()
    }
}
