package com.pochak.android.ui.screens.signup

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// TermsAgreementScreen
// ────────────────────────────────────────────────────────

@Composable
fun TermsAgreementScreen(
    onBackClick: () -> Unit = {},
    onNextClick: (TermsAgreementResult) -> Unit = {},
    onViewTerms: (TermsType) -> Unit = {},
    onForeignerClick: () -> Unit = {},
) {
    var isOver14 by remember { mutableStateOf(false) }
    var serviceTerms by remember { mutableStateOf(false) }
    var privacyTerms by remember { mutableStateOf(false) }
    var thirdPartyTerms by remember { mutableStateOf(false) }
    var marketingTerms by remember { mutableStateOf(false) }
    var smsConsent by remember { mutableStateOf(false) }
    var emailConsent by remember { mutableStateOf(false) }
    var pushConsent by remember { mutableStateOf(false) }
    var nightPushConsent by remember { mutableStateOf(false) }

    val allRequired = isOver14 && serviceTerms && privacyTerms
    val allChecked = isOver14 && serviceTerms && privacyTerms &&
        thirdPartyTerms && marketingTerms &&
        smsConsent && emailConsent && pushConsent && nightPushConsent

    fun toggleAll(checked: Boolean) {
        isOver14 = checked
        serviceTerms = checked
        privacyTerms = checked
        thirdPartyTerms = checked
        marketingTerms = checked
        smsConsent = checked
        emailConsent = checked
        pushConsent = checked
        nightPushConsent = checked
    }

    fun toggleMarketing(checked: Boolean) {
        marketingTerms = checked
        if (!checked) {
            smsConsent = false
            emailConsent = false
            pushConsent = false
            nightPushConsent = false
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Terms agreement screen" },
    ) {
        // ── Top Bar ──
        SignUpTopBar(
            onBackClick = onBackClick,
            trailingContent = {
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
                        text = "\uD83C\uDF10",
                        style = PochakTypographyTokens.Body02,
                    )
                }
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
                text = "서비스 약관동의",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextPrimary,
            )

            Spacer(modifier = Modifier.height(32.dp))

            // ── Select All ──
            PochakCheckboxRow(
                text = "전체동의",
                checked = allChecked,
                onCheckedChange = { toggleAll(it) },
                textStyle = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.SemiBold),
                outlined = true,
            )

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 16.dp),
                thickness = 1.dp,
                color = PochakColors.Border,
            )

            // ── Individual Terms ──
            PochakCheckboxRow(
                text = "만 14세 이상",
                checked = isOver14,
                onCheckedChange = { isOver14 = it },
            )

            Spacer(modifier = Modifier.height(12.dp))

            PochakCheckboxRow(
                text = "(필수) 서비스이용약관 동의",
                checked = serviceTerms,
                onCheckedChange = { serviceTerms = it },
                trailingAction = "전문보기",
                onTrailingClick = { onViewTerms(TermsType.SERVICE) },
            )

            Spacer(modifier = Modifier.height(12.dp))

            PochakCheckboxRow(
                text = "(필수) 개인정보 수집 및 이용 동의",
                checked = privacyTerms,
                onCheckedChange = { privacyTerms = it },
                trailingAction = "전문보기",
                onTrailingClick = { onViewTerms(TermsType.PRIVACY) },
            )

            Spacer(modifier = Modifier.height(12.dp))

            PochakCheckboxRow(
                text = "(선택) 개인정보 제 3자 제공 동의",
                checked = thirdPartyTerms,
                onCheckedChange = { thirdPartyTerms = it },
                trailingAction = "전문보기",
                onTrailingClick = { onViewTerms(TermsType.THIRD_PARTY) },
            )

            Spacer(modifier = Modifier.height(12.dp))

            PochakCheckboxRow(
                text = "(선택) 마케팅 정보 수신 동의",
                checked = marketingTerms,
                onCheckedChange = { toggleMarketing(it) },
                trailingAction = "전문보기",
                onTrailingClick = { onViewTerms(TermsType.MARKETING) },
            )

            // ── Marketing Sub-options ──
            AnimatedVisibility(
                visible = marketingTerms,
                enter = expandVertically(),
                exit = shrinkVertically(),
            ) {
                Column(
                    modifier = Modifier.padding(start = 36.dp, top = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    PochakCheckboxRow(
                        text = "SMS 수신",
                        checked = smsConsent,
                        onCheckedChange = { smsConsent = it },
                        compact = true,
                    )
                    PochakCheckboxRow(
                        text = "이메일 수신",
                        checked = emailConsent,
                        onCheckedChange = { emailConsent = it },
                        compact = true,
                    )
                    PochakCheckboxRow(
                        text = "푸시 알림 수신",
                        checked = pushConsent,
                        onCheckedChange = { pushConsent = it },
                        compact = true,
                    )
                    PochakCheckboxRow(
                        text = "야간 서비스 알림 수신 (21시 ~ 08시)",
                        checked = nightPushConsent,
                        onCheckedChange = { nightPushConsent = it },
                        compact = true,
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // ── Foreigner link ──
            Text(
                text = "Not Korean?",
                style = PochakTypographyTokens.Body03.copy(
                    textDecoration = TextDecoration.Underline,
                ),
                color = PochakColors.TextSecondary,
                modifier = Modifier
                    .clickable(onClick = onForeignerClick)
                    .padding(vertical = 4.dp),
            )

            Spacer(modifier = Modifier.height(24.dp))
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
                onClick = {
                    onNextClick(
                        TermsAgreementResult(
                            thirdPartyConsent = thirdPartyTerms,
                            marketingConsent = marketingTerms,
                            smsConsent = smsConsent,
                            emailConsent = emailConsent,
                            pushConsent = pushConsent,
                            nightPushConsent = nightPushConsent,
                        )
                    )
                },
                enabled = allRequired,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Data models
// ────────────────────────────────────────────────────────

data class TermsAgreementResult(
    val thirdPartyConsent: Boolean,
    val marketingConsent: Boolean,
    val smsConsent: Boolean,
    val emailConsent: Boolean,
    val pushConsent: Boolean,
    val nightPushConsent: Boolean,
)

enum class TermsType {
    SERVICE,
    PRIVACY,
    THIRD_PARTY,
    MARKETING,
}

// ────────────────────────────────────────────────────────
// Shared composables for signup flow
// ────────────────────────────────────────────────────────

/**
 * Reusable top bar for signup screens.
 * Provides a back arrow on the left and an optional trailing composable on the right.
 */
@Composable
internal fun SignUpTopBar(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    trailingContent: @Composable (() -> Unit)? = null,
) {
    Row(
        modifier = modifier
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
        if (trailingContent != null) {
            trailingContent()
        } else {
            Spacer(modifier = Modifier.size(48.dp))
        }
    }
}

/**
 * Custom checkbox row matching the Pochak design system.
 * - Selected: green filled square with white check
 * - Unselected: gray outlined square
 */
@Composable
internal fun PochakCheckboxRow(
    text: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    textStyle: androidx.compose.ui.text.TextStyle = PochakTypographyTokens.Body02,
    trailingAction: String? = null,
    onTrailingClick: (() -> Unit)? = null,
    outlined: Boolean = false,
    compact: Boolean = false,
) {
    val checkboxSize = if (compact) 18.dp else 22.dp
    val checkIconSize = if (compact) 14.dp else 16.dp

    Row(
        modifier = modifier
            .fillMaxWidth()
            .then(
                if (outlined) {
                    Modifier
                        .border(
                            width = 1.dp,
                            color = if (checked) PochakColors.Primary else PochakColors.BorderLight,
                            shape = PochakShapes.Base,
                        )
                        .padding(horizontal = 12.dp, vertical = 14.dp)
                } else {
                    Modifier
                }
            )
            .clickable { onCheckedChange(!checked) },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Custom checkbox
        Box(
            modifier = Modifier
                .size(checkboxSize)
                .clip(RoundedCornerShape(4.dp))
                .then(
                    if (checked) {
                        Modifier.background(PochakColors.Primary)
                    } else {
                        Modifier.border(
                            width = 1.5.dp,
                            color = PochakColors.BorderLight,
                            shape = RoundedCornerShape(4.dp),
                        )
                    }
                ),
            contentAlignment = Alignment.Center,
        ) {
            if (checked) {
                Icon(
                    imageVector = Icons.Filled.Check,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(checkIconSize),
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        Text(
            text = text,
            style = textStyle,
            color = PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
        )

        if (trailingAction != null && onTrailingClick != null) {
            Text(
                text = trailingAction,
                style = PochakTypographyTokens.Body03,
                color = PochakColors.Primary,
                modifier = Modifier
                    .clickable(onClick = onTrailingClick)
                    .padding(start = 8.dp, top = 4.dp, bottom = 4.dp),
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Shared bottom bar for additional info screens
// ────────────────────────────────────────────────────────

@Composable
internal fun AdditionalInfoBottomBar(
    stepLabel: String,
    buttonText: String,
    onButtonClick: () -> Unit,
    modifier: Modifier = Modifier,
    buttonEnabled: Boolean = true,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(PochakColors.Surface)
            .navigationBarsPadding()
            .padding(horizontal = 24.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = stepLabel,
            style = PochakTypographyTokens.Body03,
            color = PochakColors.TextSecondary,
        )
        Button(
            onClick = onButtonClick,
            enabled = buttonEnabled,
            shape = PochakShapes.Button,
            colors = ButtonDefaults.buttonColors(
                containerColor = PochakColors.Primary,
                contentColor = PochakColors.TextOnPrimary,
                disabledContainerColor = PochakColors.TextDisabled,
                disabledContentColor = PochakColors.TextTertiary,
            ),
            contentPadding = PaddingValues(horizontal = 32.dp, vertical = 12.dp),
        ) {
            Text(
                text = buttonText,
                style = PochakTypographyTokens.ButtonMedium,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewTermsAgreementScreen() {
    PochakTheme {
        TermsAgreementScreen()
    }
}
