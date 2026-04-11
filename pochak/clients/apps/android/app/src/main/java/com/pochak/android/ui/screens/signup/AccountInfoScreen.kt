package com.pochak.android.ui.screens.signup

import androidx.compose.foundation.background
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.components.PochakTextField
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// AccountInfoScreen
// ────────────────────────────────────────────────────────

data class AccountInfoResult(
    val userId: String,
    val password: String,
    val email: String?,
    val birthYear: String?,
    val birthMonth: String?,
    val birthDay: String?,
)

@Composable
fun AccountInfoScreen(
    isForeigner: Boolean = false,
    onBackClick: () -> Unit = {},
    onNextClick: (AccountInfoResult) -> Unit = {},
    onCheckDuplicate: (String, (Boolean) -> Unit) -> Unit = { _, cb -> cb(true) },
) {
    var userId by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var selectedEmailDomain by remember { mutableStateOf("@address.com") }
    var emailDomainExpanded by remember { mutableStateOf(false) }
    var idChecked by remember { mutableStateOf(false) }
    var idAvailable by remember { mutableStateOf<Boolean?>(null) }
    var isCheckingId by remember { mutableStateOf(false) }

    // Birthday fields (foreigner mode)
    var birthYear by remember { mutableStateOf("") }
    var birthMonth by remember { mutableStateOf("") }
    var birthDay by remember { mutableStateOf("") }
    var yearExpanded by remember { mutableStateOf(false) }
    var monthExpanded by remember { mutableStateOf(false) }
    var dayExpanded by remember { mutableStateOf(false) }

    val emailDomains = listOf(
        "@address.com", "@gmail.com", "@naver.com", "@daum.net", "@yahoo.com",
    )

    val passwordsMatch = password.isNotBlank() && password == confirmPassword
    val isFormValid = if (isForeigner) {
        idChecked && idAvailable == true && passwordsMatch &&
            birthYear.isNotBlank() && birthMonth.isNotBlank() && birthDay.isNotBlank()
    } else {
        idChecked && idAvailable == true && passwordsMatch && email.isNotBlank()
    }

    // Reset duplicate check when ID changes
    LaunchedEffect(userId) {
        idChecked = false
        idAvailable = null
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics {
                contentDescription = "Account info screen"
            },
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

            Text(
                text = if (isForeigner) "Create account." else "계정정보 입력",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextPrimary,
            )

            Spacer(modifier = Modifier.height(32.dp))

            // ── User ID ──
            Text(
                text = if (isForeigner) "User ID" else "아이디",
                style = PochakTypographyTokens.Body03,
                color = PochakColors.TextSecondary,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                PochakTextField(
                    value = userId,
                    onValueChange = { userId = it },
                    placeholder = if (isForeigner) "User ID" else "아이디",
                    modifier = Modifier.weight(1f),
                )
                Button(
                    onClick = {
                        isCheckingId = true
                        onCheckDuplicate(userId) { available ->
                            isCheckingId = false
                            idChecked = true
                            idAvailable = available
                        }
                    },
                    enabled = userId.isNotBlank() && !isCheckingId,
                    shape = PochakShapes.Button,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = PochakColors.Primary,
                        contentColor = PochakColors.TextOnPrimary,
                        disabledContainerColor = PochakColors.TextDisabled,
                        disabledContentColor = PochakColors.TextTertiary,
                    ),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 14.dp),
                ) {
                    if (isCheckingId) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = PochakColors.TextOnPrimary,
                            strokeWidth = 2.dp,
                        )
                    } else {
                        Text(
                            text = if (isForeigner) "ID Check" else "중복체크",
                            style = PochakTypographyTokens.Body03.copy(
                                fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold,
                            ),
                        )
                    }
                }
            }
            // Duplicate check feedback
            if (idChecked && idAvailable != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (idAvailable == true) {
                        if (isForeigner) "Available!" else "사용 가능한 아이디입니다."
                    } else {
                        if (isForeigner) "Already taken." else "이미 사용 중인 아이디입니다."
                    },
                    style = PochakTypographyTokens.Body04,
                    color = if (idAvailable == true) PochakColors.Primary else PochakColors.Error,
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Password ──
            Text(
                text = if (isForeigner) "Password" else "비밀번호",
                style = PochakTypographyTokens.Body03,
                color = PochakColors.TextSecondary,
            )
            Spacer(modifier = Modifier.height(8.dp))
            PochakTextField(
                value = password,
                onValueChange = { password = it },
                placeholder = if (isForeigner) "Password" else "비밀번호",
                isPassword = true,
            )

            Spacer(modifier = Modifier.height(16.dp))

            // ── Confirm Password ──
            Text(
                text = if (isForeigner) "Confirm Password" else "비밀번호 확인",
                style = PochakTypographyTokens.Body03,
                color = PochakColors.TextSecondary,
            )
            Spacer(modifier = Modifier.height(8.dp))
            PochakTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                placeholder = if (isForeigner) "Confirm Password" else "비밀번호 확인",
                isPassword = true,
            )
            if (confirmPassword.isNotBlank() && !passwordsMatch) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (isForeigner) "Passwords do not match." else "비밀번호가 일치하지 않습니다.",
                    style = PochakTypographyTokens.Body04,
                    color = PochakColors.Error,
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            if (isForeigner) {
                // ── Birthday dropdowns (foreigner) ──
                Text(
                    text = "Date of Birth",
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextSecondary,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    // Year
                    BirthdayDropdown(
                        label = if (birthYear.isBlank()) "Year" else birthYear,
                        expanded = yearExpanded,
                        onExpandChange = { yearExpanded = it },
                        items = (1930..2025).map { it.toString() }.reversed(),
                        onItemSelected = {
                            birthYear = it
                            yearExpanded = false
                        },
                        modifier = Modifier.weight(1f),
                    )
                    // Month
                    BirthdayDropdown(
                        label = if (birthMonth.isBlank()) "Month" else birthMonth,
                        expanded = monthExpanded,
                        onExpandChange = { monthExpanded = it },
                        items = (1..12).map { it.toString().padStart(2, '0') },
                        onItemSelected = {
                            birthMonth = it
                            monthExpanded = false
                        },
                        modifier = Modifier.weight(1f),
                    )
                    // Day
                    BirthdayDropdown(
                        label = if (birthDay.isBlank()) "Day" else birthDay,
                        expanded = dayExpanded,
                        onExpandChange = { dayExpanded = it },
                        items = (1..31).map { it.toString().padStart(2, '0') },
                        onItemSelected = {
                            birthDay = it
                            dayExpanded = false
                        },
                        modifier = Modifier.weight(1f),
                    )
                }
            } else {
                // ── Email (Korean) ──
                Text(
                    text = "이메일",
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextSecondary,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    PochakTextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = "이메일",
                        modifier = Modifier.weight(1f),
                    )

                    Box {
                        OutlinedButton(
                            onClick = { emailDomainExpanded = true },
                            shape = PochakShapes.TextField,
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = PochakColors.TextPrimary,
                            ),
                            border = ButtonDefaults.outlinedButtonBorder(true),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 14.dp),
                        ) {
                            Text(
                                text = selectedEmailDomain,
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
                            expanded = emailDomainExpanded,
                            onDismissRequest = { emailDomainExpanded = false },
                            containerColor = PochakColors.Surface,
                        ) {
                            emailDomains.forEach { domain ->
                                DropdownMenuItem(
                                    text = {
                                        Text(
                                            text = domain,
                                            style = PochakTypographyTokens.Body03,
                                            color = if (domain == selectedEmailDomain)
                                                PochakColors.Primary else PochakColors.TextPrimary,
                                        )
                                    },
                                    onClick = {
                                        selectedEmailDomain = domain
                                        emailDomainExpanded = false
                                    },
                                )
                            }
                        }
                    }
                }
            }

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
                text = if (isForeigner) "Next" else "다음",
                onClick = {
                    onNextClick(
                        AccountInfoResult(
                            userId = userId,
                            password = password,
                            email = if (isForeigner) null else "$email$selectedEmailDomain",
                            birthYear = if (isForeigner) birthYear else null,
                            birthMonth = if (isForeigner) birthMonth else null,
                            birthDay = if (isForeigner) birthDay else null,
                        )
                    )
                },
                enabled = isFormValid,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// BirthdayDropdown
// ────────────────────────────────────────────────────────

@Composable
private fun BirthdayDropdown(
    label: String,
    expanded: Boolean,
    onExpandChange: (Boolean) -> Unit,
    items: List<String>,
    onItemSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier) {
        OutlinedButton(
            onClick = { onExpandChange(true) },
            modifier = Modifier.fillMaxWidth(),
            shape = PochakShapes.TextField,
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = PochakColors.TextPrimary,
            ),
            border = ButtonDefaults.outlinedButtonBorder(true),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 14.dp),
        ) {
            Text(
                text = label,
                style = PochakTypographyTokens.Body03,
                modifier = Modifier.weight(1f),
            )
            Icon(
                imageVector = Icons.Filled.ArrowDropDown,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
            )
        }

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { onExpandChange(false) },
            containerColor = PochakColors.Surface,
            modifier = Modifier.heightIn(max = 200.dp),
        ) {
            items.forEach { item ->
                DropdownMenuItem(
                    text = {
                        Text(
                            text = item,
                            style = PochakTypographyTokens.Body03,
                            color = PochakColors.TextPrimary,
                        )
                    },
                    onClick = { onItemSelected(item) },
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewAccountInfoScreenKorean() {
    PochakTheme {
        AccountInfoScreen(isForeigner = false)
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewAccountInfoScreenForeigner() {
    PochakTheme {
        AccountInfoScreen(isForeigner = true)
    }
}
