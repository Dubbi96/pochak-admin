package com.pochak.android.ui.screens.signup

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.components.PochakTextField
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// GuardianVerificationScreen
// ────────────────────────────────────────────────────────

@Composable
fun GuardianVerificationScreen(
    onBackClick: () -> Unit = {},
    onNextClick: (String) -> Unit = {},
    onRequestVerification: (String, (Boolean) -> Unit) -> Unit = { _, _ -> },
) {
    var phoneNumber by remember { mutableStateOf("") }
    var verificationCode by remember { mutableStateOf("") }
    var isCodeSent by remember { mutableStateOf(false) }
    var isVerified by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var verifiedNumber by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Guardian verification screen" },
    ) {
        // ── Top Bar ──
        SignUpTopBar(onBackClick = onBackClick)

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // ── Title ──
            Text(
                text = "법정대리인 본인 인증",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextPrimary,
            )

            Spacer(modifier = Modifier.height(12.dp))

            // ── Info notice ──
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        color = PochakColors.SurfaceVariant,
                        shape = PochakShapes.Base,
                    )
                    .padding(horizontal = 12.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Icon(
                    imageVector = Icons.Filled.Info,
                    contentDescription = null,
                    tint = PochakColors.Primary,
                    modifier = Modifier.size(18.dp),
                )
                Text(
                    text = "법정대리인 정보는 가입시 함께 보관됩니다.",
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextSecondary,
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            if (isVerified) {
                // ── Verified state ──
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            color = PochakColors.SurfaceVariant,
                            shape = PochakShapes.TextField,
                        )
                        .padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(
                        text = verifiedNumber,
                        style = PochakTypographyTokens.Body02,
                        color = PochakColors.TextPrimary,
                    )
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = "Verified",
                        tint = PochakColors.Primary,
                        modifier = Modifier.size(24.dp),
                    )
                }
            } else if (!isCodeSent) {
                // ── Phone number input ──
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    PochakTextField(
                        value = phoneNumber,
                        onValueChange = { phoneNumber = it },
                        placeholder = "연락처",
                        modifier = Modifier.weight(1f),
                    )
                    TextButton(
                        onClick = {
                            isLoading = true
                            onRequestVerification(phoneNumber) { success ->
                                isLoading = false
                                if (success) isCodeSent = true
                            }
                        },
                        enabled = phoneNumber.isNotBlank() && !isLoading,
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = PochakColors.Primary,
                                strokeWidth = 2.dp,
                            )
                        } else {
                            Text(
                                text = "인증하기",
                                style = PochakTypographyTokens.ButtonMedium,
                                color = PochakColors.Primary,
                            )
                        }
                    }
                }
            } else {
                // ── Verification code input ──
                Text(
                    text = phoneNumber,
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.TextSecondary,
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    PochakTextField(
                        value = verificationCode,
                        onValueChange = { verificationCode = it },
                        placeholder = "인증번호 입력",
                        modifier = Modifier.weight(1f),
                    )
                    Button(
                        onClick = {
                            isVerified = true
                            verifiedNumber = phoneNumber
                        },
                        enabled = verificationCode.length >= 4,
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
                            text = "확인",
                            style = PochakTypographyTokens.ButtonMedium,
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "인증번호가 발송되었습니다.",
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextSecondary,
                )
            }
        }

        // ── Bottom Button ──
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(PochakColors.Background)
                .padding(horizontal = 24.dp, vertical = 16.dp)
                .navigationBarsPadding(),
        ) {
            PochakButton(
                text = "다음",
                onClick = { onNextClick(verifiedNumber) },
                enabled = isVerified,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewGuardianVerificationScreen() {
    PochakTheme {
        GuardianVerificationScreen()
    }
}
