package com.pochak.android.ui.screens.signup

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.components.PochakButtonStyle
import com.pochak.android.ui.components.PochakTextField
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// ForeignerEmailVerifyScreen
// ────────────────────────────────────────────────────────

private val EMAIL_DOMAINS = listOf(
    "@hogak.co.kr",
    "@gmail.com",
    "@naver.com",
    "@daum.net",
    "@yahoo.com",
)

@Composable
fun ForeignerEmailVerifyScreen(
    onBackClick: () -> Unit = {},
    onNextClick: (String) -> Unit = {},
    onSendVerification: (String, (Boolean) -> Unit) -> Unit = { _, _ -> },
    onResendEmail: (String) -> Unit = {},
    onBackToHome: () -> Unit = {},
) {
    var emailPrefix by remember { mutableStateOf("") }
    var selectedDomain by remember { mutableStateOf(EMAIL_DOMAINS.first()) }
    var domainExpanded by remember { mutableStateOf(false) }
    var emailSent by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }

    val fullEmail = "$emailPrefix$selectedDomain"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Foreigner email verification screen" },
    ) {
        // ── Top Bar ──
        SignUpTopBar(onBackClick = onBackClick)

        if (!emailSent) {
            // ── Email Input State ──
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp),
            ) {
                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Verify email.",
                    style = PochakTypographyTokens.Title03,
                    color = PochakColors.TextPrimary,
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Email input row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    PochakTextField(
                        value = emailPrefix,
                        onValueChange = { emailPrefix = it },
                        placeholder = "email",
                        modifier = Modifier.weight(1f),
                    )

                    // Domain dropdown
                    Box {
                        OutlinedButton(
                            onClick = { domainExpanded = true },
                            shape = PochakShapes.TextField,
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = PochakColors.TextPrimary,
                            ),
                            border = ButtonDefaults.outlinedButtonBorder(true),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 14.dp),
                        ) {
                            Text(
                                text = selectedDomain,
                                style = PochakTypographyTokens.Body03,
                                maxLines = 1,
                            )
                            Icon(
                                imageVector = Icons.Filled.ArrowDropDown,
                                contentDescription = "Select domain",
                                modifier = Modifier.size(18.dp),
                            )
                        }

                        DropdownMenu(
                            expanded = domainExpanded,
                            onDismissRequest = { domainExpanded = false },
                            containerColor = PochakColors.Surface,
                        ) {
                            EMAIL_DOMAINS.forEach { domain ->
                                DropdownMenuItem(
                                    text = {
                                        Text(
                                            text = domain,
                                            style = PochakTypographyTokens.Body03,
                                            color = if (domain == selectedDomain) PochakColors.Primary
                                            else PochakColors.TextPrimary,
                                        )
                                    },
                                    onClick = {
                                        selectedDomain = domain
                                        domainExpanded = false
                                    },
                                )
                            }
                        }
                    }
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
                    text = "Next",
                    onClick = {
                        isLoading = true
                        onSendVerification(fullEmail) { success ->
                            isLoading = false
                            if (success) emailSent = true
                        }
                    },
                    enabled = emailPrefix.isNotBlank() && !isLoading,
                )
            }
        } else {
            // ── Email Sent State ──
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text(
                    text = "Verification email sent.",
                    style = PochakTypographyTokens.Title03,
                    color = PochakColors.TextPrimary,
                    textAlign = TextAlign.Center,
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Please check your inbox.",
                    style = PochakTypographyTokens.Body01,
                    color = PochakColors.TextSecondary,
                    textAlign = TextAlign.Center,
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = fullEmail,
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.Primary,
                    textAlign = TextAlign.Center,
                )

                Spacer(modifier = Modifier.height(40.dp))

                PochakButton(
                    text = "Back to Home",
                    onClick = onBackToHome,
                    modifier = Modifier.fillMaxWidth(),
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Resend Email",
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.Primary,
                    modifier = Modifier
                        .clickable { onResendEmail(fullEmail) }
                        .padding(vertical = 8.dp),
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewForeignerEmailVerifyScreen() {
    PochakTheme {
        ForeignerEmailVerifyScreen()
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewForeignerEmailVerifySentScreen() {
    PochakTheme {
        // Simulates the sent state -- for real preview you'd need state manipulation
        ForeignerEmailVerifyScreen()
    }
}
