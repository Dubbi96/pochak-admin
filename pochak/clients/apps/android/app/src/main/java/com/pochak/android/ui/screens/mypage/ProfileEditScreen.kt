package com.pochak.android.ui.screens.mypage

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.data.model.SampleData
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// ProfileEditScreen
// ────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileEditScreen(
    onBackClick: () -> Unit = {},
) {
    val profile = SampleData.userProfile

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Profile edit screen" },
    ) {
        // ── Top Bar ──
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 4.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = PochakColors.TextPrimary,
                )
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 32.dp),
        ) {
            // ── Profile Header ──
            item(key = "profile_header") {
                ProfileEditHeader(
                    nickname = profile.nickname,
                    email = profile.email,
                )
            }

            // ── Password Change ──
            item(key = "password") {
                PasswordChangeRow()
            }

            item(key = "divider_1") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 4.dp),
                    color = PochakColors.Border,
                )
            }

            // ── Personal Information Section ──
            item(key = "personal_header") {
                SectionLabel(title = "개인정보")
            }

            item(key = "personal_name") {
                InfoRow(label = "이름", value = "홍길동")
            }
            item(key = "personal_birth") {
                InfoRow(label = "생년월일", value = "2000.01.01")
            }
            item(key = "personal_phone") {
                InfoRow(label = "휴대폰번호", value = "010-0000-0000")
            }
            item(key = "personal_email") {
                InfoRow(label = "이메일", value = profile.email, hasChevron = true)
            }

            item(key = "divider_2") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 4.dp),
                    color = PochakColors.Border,
                )
            }

            // ── Additional Information Section ──
            item(key = "additional_header") {
                SectionLabel(title = "추가정보")
            }

            item(key = "additional_location") {
                InfoRow(
                    label = "관심지역",
                    value = "대한민국 서울시, 대한민국 성남시, 대한민국 용인시",
                    hasChevron = true,
                )
            }
            item(key = "additional_sports") {
                InfoRow(
                    label = "관심종목",
                    value = "축구, 마라톤, 유도",
                    hasChevron = true,
                )
            }
            item(key = "additional_reason") {
                InfoRow(
                    label = "서비스이용계기",
                    value = "내 경기영상을 보고 싶어요 !",
                    hasChevron = true,
                )
            }

            item(key = "divider_3") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 8.dp),
                    color = PochakColors.Border,
                )
            }

            // ── Account Management ──
            item(key = "account_mgmt") {
                AccountManagementSection()
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Profile Edit Header
// ────────────────────────────────────────────────────────

@Composable
private fun ProfileEditHeader(
    nickname: String,
    email: String,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Avatar
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(
                    Brush.linearGradient(
                        colors = listOf(PochakColors.Primary, PochakColors.PrimaryDark),
                    )
                ),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "P",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextOnPrimary,
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Nickname with edit icon
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = nickname,
                style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextPrimary,
            )
            Icon(
                Icons.Default.Edit,
                contentDescription = "Edit nickname",
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(18.dp),
            )
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = email,
            style = PochakTypographyTokens.Body03,
            color = PochakColors.TextSecondary,
        )
    }
}

// ────────────────────────────────────────────────────────
// Password Change Row
// ────────────────────────────────────────────────────────

@Composable
private fun PasswordChangeRow() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { }
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "비밀번호 변경",
            style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.SemiBold),
            color = PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
        )
        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = "Change password",
            tint = PochakColors.TextTertiary,
            modifier = Modifier.size(22.dp),
        )
    }
}

// ────────────────────────────────────────────────────────
// Section Label
// ────────────────────────────────────────────────────────

@Composable
private fun SectionLabel(title: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(PochakColors.SurfaceVariant)
            .padding(horizontal = 16.dp, vertical = 10.dp),
    ) {
        Text(
            text = title,
            style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.Medium),
            color = PochakColors.TextSecondary,
        )
    }
}

// ────────────────────────────────────────────────────────
// Info Row
// ────────────────────────────────────────────────────────

@Composable
private fun InfoRow(
    label: String,
    value: String,
    hasChevron: Boolean = false,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .then(
                if (hasChevron) Modifier.clickable { } else Modifier
            )
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = PochakTypographyTokens.Body02,
            color = PochakColors.TextSecondary,
            modifier = Modifier.width(100.dp),
        )
        Text(
            text = value,
            style = PochakTypographyTokens.Body02,
            color = PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
            textAlign = TextAlign.End,
            maxLines = 2,
        )
        if (hasChevron) {
            Spacer(modifier = Modifier.width(4.dp))
            Icon(
                Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Edit $label",
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(20.dp),
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Account Management Section
// ────────────────────────────────────────────────────────

@Composable
private fun AccountManagementSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { }
                .padding(vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "계정 연동 관리",
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            Icon(
                Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Account linking",
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(20.dp),
            )
        }

        HorizontalDivider(color = PochakColors.Border)

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { }
                .padding(vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "가족 계정 관리",
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            Icon(
                Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Family account",
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(20.dp),
            )
        }

        HorizontalDivider(color = PochakColors.Border)

        // Withdraw account
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { }
                .padding(vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "회원 탈퇴",
                style = PochakTypographyTokens.Body02,
                color = PochakColors.Error,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewProfileEditScreen() {
    PochakTheme {
        ProfileEditScreen()
    }
}
