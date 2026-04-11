package com.pochak.android.ui.screens.findaccount

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// PasswordResetScreen
// ────────────────────────────────────────────────────────

@Composable
fun PasswordResetScreen(
    onBackClick: () -> Unit = {},
    onResetComplete: () -> Unit = {},
) {
    var password by remember { mutableStateOf("") }
    var passwordConfirm by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmVisible by remember { mutableStateOf(false) }

    val passwordsMatch = password.isNotBlank() &&
        passwordConfirm.isNotBlank() &&
        password == passwordConfirm

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .statusBarsPadding()
            .semantics { contentDescription = "Password reset screen" },
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
            text = "비밀번호 재설정",
            style = PochakTypographyTokens.Title03,
            color = PochakColors.TextPrimary,
            modifier = Modifier.padding(horizontal = 24.dp),
        )

        Spacer(modifier = Modifier.height(32.dp))

        // ── Password fields card ──
        Column(
            modifier = Modifier
                .padding(horizontal = 24.dp)
                .fillMaxWidth()
                .clip(PochakShapes.Medium)
                .background(PochakColors.SurfaceVariant),
        ) {
            // Password field
            PasswordCardField(
                value = password,
                onValueChange = { password = it },
                placeholder = "비밀번호",
                isVisible = passwordVisible,
                onToggleVisibility = { passwordVisible = !passwordVisible },
            )

            // Divider
            HorizontalDivider(
                color = PochakColors.Border,
                thickness = 1.dp,
                modifier = Modifier.padding(horizontal = 16.dp),
            )

            // Password confirm field
            PasswordCardField(
                value = passwordConfirm,
                onValueChange = { passwordConfirm = it },
                placeholder = "비밀번호 확인",
                isVisible = confirmVisible,
                onToggleVisibility = { confirmVisible = !confirmVisible },
            )
        }

        // ── Mismatch warning ──
        if (passwordConfirm.isNotBlank() && password != passwordConfirm) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "비밀번호가 일치하지 않습니다.",
                style = PochakTypographyTokens.Body03,
                color = PochakColors.Error,
                modifier = Modifier.padding(horizontal = 24.dp),
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        // ── Reset button ──
        PochakButton(
            text = "재설정",
            onClick = onResetComplete,
            enabled = passwordsMatch,
            modifier = Modifier.padding(horizontal = 24.dp),
        )

        Spacer(modifier = Modifier.height(32.dp))
    }
}

// ────────────────────────────────────────────────────────
// Password Card Field (inline in card)
// ────────────────────────────────────────────────────────

@Composable
private fun PasswordCardField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    isVisible: Boolean,
    onToggleVisibility: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.weight(1f),
            placeholder = {
                Text(
                    text = placeholder,
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.TextTertiary,
                )
            },
            visualTransformation = if (isVisible) {
                VisualTransformation.None
            } else {
                PasswordVisualTransformation()
            },
            colors = TextFieldDefaults.colors(
                focusedTextColor = PochakColors.TextPrimary,
                unfocusedTextColor = PochakColors.TextPrimary,
                cursorColor = PochakColors.Primary,
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                disabledContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                disabledIndicatorColor = Color.Transparent,
            ),
            textStyle = PochakTypographyTokens.Body02.copy(color = PochakColors.TextPrimary),
            singleLine = true,
        )

        IconButton(onClick = onToggleVisibility) {
            Icon(
                imageVector = if (isVisible) Icons.Filled.Visibility
                else Icons.Filled.VisibilityOff,
                contentDescription = if (isVisible) "Hide password" else "Show password",
                tint = PochakColors.TextTertiary,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewPasswordResetScreen() {
    PochakTheme {
        PasswordResetScreen()
    }
}
