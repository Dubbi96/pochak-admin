package com.pochak.android.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.pochak.android.data.model.ContentType
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// PochakButton
// ────────────────────────────────────────────────────────

enum class PochakButtonStyle { PRIMARY, SECONDARY, GHOST }

@Composable
fun PochakButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    style: PochakButtonStyle = PochakButtonStyle.PRIMARY,
    enabled: Boolean = true,
) {
    val interactionSource = remember { MutableInteractionSource() }

    when (style) {
        PochakButtonStyle.PRIMARY -> {
            Button(
                onClick = onClick,
                modifier = modifier
                    .fillMaxWidth()
                    .height(52.dp),
                enabled = enabled,
                shape = PochakShapes.Button,
                colors = ButtonDefaults.buttonColors(
                    containerColor = PochakColors.Primary,
                    contentColor = PochakColors.TextOnPrimary,
                    disabledContainerColor = PochakColors.TextDisabled,
                    disabledContentColor = PochakColors.TextTertiary,
                ),
                interactionSource = interactionSource,
            ) {
                Text(
                    text = text,
                    style = PochakTypographyTokens.ButtonLarge,
                )
            }
        }

        PochakButtonStyle.SECONDARY -> {
            OutlinedButton(
                onClick = onClick,
                modifier = modifier
                    .fillMaxWidth()
                    .height(52.dp),
                enabled = enabled,
                shape = PochakShapes.Button,
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = PochakColors.Primary,
                    disabledContentColor = PochakColors.TextTertiary,
                ),
                border = ButtonDefaults.outlinedButtonBorder(enabled),
                interactionSource = interactionSource,
            ) {
                Text(
                    text = text,
                    style = PochakTypographyTokens.ButtonLarge,
                )
            }
        }

        PochakButtonStyle.GHOST -> {
            TextButton(
                onClick = onClick,
                modifier = modifier.height(48.dp),
                enabled = enabled,
                colors = ButtonDefaults.textButtonColors(
                    contentColor = PochakColors.TextSecondary,
                    disabledContentColor = PochakColors.TextTertiary,
                ),
                interactionSource = interactionSource,
            ) {
                Text(
                    text = text,
                    style = PochakTypographyTokens.ButtonMedium,
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// PochakTextField
// ────────────────────────────────────────────────────────

@Composable
fun PochakTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    isPassword: Boolean = false,
    trailingContent: @Composable (() -> Unit)? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    singleLine: Boolean = true,
    enabled: Boolean = true,
) {
    var passwordVisible by remember { mutableStateOf(false) }

    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier.fillMaxWidth(),
        placeholder = {
            Text(
                text = placeholder,
                color = PochakColors.TextTertiary,
                style = PochakTypographyTokens.Body02,
            )
        },
        visualTransformation = if (isPassword && !passwordVisible) {
            PasswordVisualTransformation()
        } else {
            VisualTransformation.None
        },
        trailingIcon = when {
            isPassword -> {
                {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Filled.Visibility
                            else Icons.Filled.VisibilityOff,
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = PochakColors.TextTertiary,
                        )
                    }
                }
            }
            trailingContent != null -> {
                { trailingContent() }
            }
            else -> null
        },
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = PochakColors.TextPrimary,
            unfocusedTextColor = PochakColors.TextPrimary,
            disabledTextColor = PochakColors.TextDisabled,
            cursorColor = PochakColors.Primary,
            focusedBorderColor = PochakColors.Primary,
            unfocusedBorderColor = PochakColors.BorderLight,
            disabledBorderColor = PochakColors.TextDisabled,
            focusedContainerColor = Color.Transparent,
            unfocusedContainerColor = Color.Transparent,
        ),
        shape = PochakShapes.TextField,
        textStyle = PochakTypographyTokens.Body02.copy(color = PochakColors.TextPrimary),
        singleLine = singleLine,
        enabled = enabled,
        keyboardOptions = keyboardOptions,
        keyboardActions = keyboardActions,
    )
}

// ────────────────────────────────────────────────────────
// PochakBadge
// ────────────────────────────────────────────────────────

@Composable
fun PochakBadge(
    type: ContentType,
    modifier: Modifier = Modifier,
) {
    val (bgColor, label) = when (type) {
        ContentType.LIVE -> PochakColors.BadgeLive to "LIVE"
        ContentType.VOD -> PochakColors.BadgeVod to "VOD"
        ContentType.CLIP -> PochakColors.BadgeClip to "CLIP"
        ContentType.SCHEDULED -> PochakColors.BadgeScheduled to "Scheduled"
    }

    val infiniteTransition = rememberInfiniteTransition(label = "badge_pulse")
    val alpha by if (type == ContentType.LIVE) {
        infiniteTransition.animateFloat(
            initialValue = 1f,
            targetValue = 0.5f,
            animationSpec = infiniteRepeatable(
                animation = tween(800, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "live_pulse",
        )
    } else {
        remember { mutableFloatStateOf(1f) }
    }

    Box(
        modifier = modifier
            .graphicsLayer { this.alpha = alpha }
            .background(
                color = bgColor,
                shape = PochakShapes.Badge,
            )
            .padding(horizontal = 8.dp, vertical = 3.dp)
            .semantics { contentDescription = "$label badge" },
    ) {
        Text(
            text = label,
            color = if (type == ContentType.CLIP) Color.Black else Color.White,
            style = PochakTypographyTokens.Overline,
        )
    }
}

// ────────────────────────────────────────────────────────
// PochakCard  -- tap scale + green glow border
// ────────────────────────────────────────────────────────

@Composable
fun PochakCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    var pressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.97f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "card_scale",
    )

    Card(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .border(
                width = 1.dp,
                color = PochakColors.Border,
                shape = PochakShapes.Card,
            )
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
            ) {
                pressed = true
                onClick()
            },
        shape = PochakShapes.Card,
        colors = CardDefaults.cardColors(
            containerColor = PochakColors.Card,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        content = content,
    )

    // Reset pressed after short delay
    LaunchedEffect(pressed) {
        if (pressed) {
            kotlinx.coroutines.delay(150)
            pressed = false
        }
    }
}

// ────────────────────────────────────────────────────────
// PochakSkeleton -- shimmer loading placeholder
// ────────────────────────────────────────────────────────

@Composable
fun PochakSkeleton(
    modifier: Modifier = Modifier,
    shape: RoundedCornerShape = PochakShapes.Medium,
) {
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")
    val shimmerOffset by infiniteTransition.animateFloat(
        initialValue = -300f,
        targetValue = 900f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "shimmer_offset",
    )

    val shimmerBrush = Brush.linearGradient(
        colors = listOf(
            PochakColors.SurfaceVariant,
            PochakColors.BorderLight,
            PochakColors.SurfaceVariant,
        ),
        start = Offset(shimmerOffset, 0f),
        end = Offset(shimmerOffset + 300f, 0f),
    )

    Box(
        modifier = modifier
            .clip(shape)
            .background(shimmerBrush)
            .semantics { contentDescription = "Loading placeholder" },
    )
}

// ────────────────────────────────────────────────────────
// ContentThumbnail -- placeholder image with badge overlay
// ────────────────────────────────────────────────────────

@Composable
fun ContentThumbnail(
    modifier: Modifier = Modifier,
    contentType: ContentType? = null,
    duration: String? = null,
    aspectRatio: Float = 16f / 9f,
) {
    Box(
        modifier = modifier
            .aspectRatio(aspectRatio)
            .clip(PochakShapes.Medium)
            .background(PochakColors.SurfaceVariant),
    ) {
        // Gradient overlay at bottom
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.4f)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, PochakColors.Overlay),
                    )
                ),
        )

        // Badge top-left
        if (contentType != null) {
            PochakBadge(
                type = contentType,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(8.dp),
            )
        }

        // Duration bottom-right
        if (!duration.isNullOrBlank()) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(8.dp)
                    .background(
                        color = PochakColors.Overlay,
                        shape = PochakShapes.Small,
                    )
                    .padding(horizontal = 6.dp, vertical = 2.dp),
            ) {
                Text(
                    text = duration,
                    color = PochakColors.TextPrimary,
                    style = PochakTypographyTokens.Body04,
                )
            }
        }

        // Placeholder icon center
        Text(
            text = "P",
            modifier = Modifier.align(Alignment.Center),
            color = PochakColors.TextTertiary,
            style = PochakTypographyTokens.Title03,
        )
    }
}

// ────────────────────────────────────────────────────────
// SectionHeader
// ────────────────────────────────────────────────────────

@Composable
fun SectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    onMoreClick: (() -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = title,
            style = PochakTypographyTokens.Title04,
            color = PochakColors.TextPrimary,
        )
        if (onMoreClick != null) {
            Text(
                text = ">",
                modifier = Modifier
                    .clickable(onClick = onMoreClick)
                    .padding(4.dp),
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextSecondary,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, backgroundColor = 0xFF121212)
@Composable
private fun PreviewPochakButton() {
    PochakTheme {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            PochakButton("Primary Button", onClick = {})
            PochakButton("Secondary", onClick = {}, style = PochakButtonStyle.SECONDARY)
            PochakButton("Ghost", onClick = {}, style = PochakButtonStyle.GHOST)
            PochakButton("Disabled", onClick = {}, enabled = false)
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF121212)
@Composable
private fun PreviewPochakBadges() {
    PochakTheme {
        Row(
            Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            PochakBadge(ContentType.LIVE)
            PochakBadge(ContentType.VOD)
            PochakBadge(ContentType.CLIP)
            PochakBadge(ContentType.SCHEDULED)
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF121212)
@Composable
private fun PreviewPochakSkeleton() {
    PochakTheme {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            PochakSkeleton(Modifier.fillMaxWidth().height(180.dp))
            PochakSkeleton(Modifier.fillMaxWidth().height(16.dp))
            PochakSkeleton(Modifier.width(120.dp).height(12.dp))
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF121212)
@Composable
private fun PreviewContentThumbnail() {
    PochakTheme {
        ContentThumbnail(
            modifier = Modifier.width(300.dp),
            contentType = ContentType.LIVE,
            duration = "01:30:00",
        )
    }
}
