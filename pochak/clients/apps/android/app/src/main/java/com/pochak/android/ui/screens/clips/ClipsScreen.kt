package com.pochak.android.ui.screens.clips

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.snapping.rememberSnapFlingBehavior
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pochak.android.data.model.*
import com.pochak.android.ui.theme.*

// ════════════════════════════════════════════════════════
// ClipsScreen  --  short-form vertical video feed
// ════════════════════════════════════════════════════════

@Composable
fun ClipsScreen(
    onClipClick: (Long) -> Unit = {},
) {
    val clips = SampleData.clipFeedItems
    val listState = rememberLazyListState()
    val flingBehavior = rememberSnapFlingBehavior(lazyListState = listState)
    var isMuted by remember { mutableStateOf(false) }
    var isAiMode by remember { mutableStateOf(false) }

    // Track currently visible item
    val currentIndex by remember {
        derivedStateOf {
            val layoutInfo = listState.layoutInfo
            val visibleItems = layoutInfo.visibleItemsInfo
            if (visibleItems.isEmpty()) 0
            else {
                val viewportCenter = layoutInfo.viewportStartOffset +
                    (layoutInfo.viewportEndOffset - layoutInfo.viewportStartOffset) / 2
                visibleItems.minByOrNull {
                    kotlin.math.abs((it.offset + it.size / 2) - viewportCenter)
                }?.index ?: 0
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .semantics { contentDescription = "Clips feed screen" },
    ) {
        // Full-screen pager-style vertical list
        LazyColumn(
            state = listState,
            flingBehavior = flingBehavior,
            modifier = Modifier.fillMaxSize(),
        ) {
            itemsIndexed(
                items = clips,
                key = { _, item -> item.id },
            ) { index, clip ->
                ClipFullScreenItem(
                    clip = clip,
                    isActive = index == currentIndex,
                    isMuted = isMuted,
                    onClipClick = { onClipClick(clip.id) },
                )
            }
        }

        // Top bar overlay
        ClipTopBar(
            isMuted = isMuted,
            isAiMode = isAiMode,
            onMuteToggle = { isMuted = !isMuted },
            onAiModeToggle = { isAiMode = !isAiMode },
            modifier = Modifier.align(Alignment.TopCenter),
        )
    }
}

// ────────────────────────────────────────────────────────
// Full-screen clip item
// ────────────────────────────────────────────────────────

@Composable
private fun ClipFullScreenItem(
    clip: ClipFeedItem,
    isActive: Boolean,
    isMuted: Boolean,
    onClipClick: () -> Unit,
) {
    val screenHeight = LocalConfiguration.current.screenHeightDp.dp

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(screenHeight)
            .clickable(onClick = onClipClick),
    ) {
        // Video placeholder (dark background simulating video)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF1A1A2E),
                            Color(0xFF16213E),
                            Color(0xFF0F3460),
                        ),
                    )
                ),
            contentAlignment = Alignment.Center,
        ) {
            // Placeholder play icon when not active
            if (!isActive) {
                Icon(
                    imageVector = Icons.Default.PlayCircleFilled,
                    contentDescription = "Play clip",
                    tint = Color.White.copy(alpha = 0.4f),
                    modifier = Modifier.size(64.dp),
                )
            } else {
                // "Playing" indicator placeholder
                Text(
                    text = "P",
                    style = PochakTypographyTokens.LogoLarge.copy(fontSize = 72.sp),
                    color = Color.White.copy(alpha = 0.08f),
                )
            }
        }

        // Bottom gradient overlay
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.45f)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.8f)),
                    )
                ),
        )

        // Right side action buttons
        ClipActionButtons(
            clip = clip,
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(end = 12.dp)
                .offset(y = 60.dp),
        )

        // Bottom info overlay
        ClipInfoOverlay(
            clip = clip,
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 16.dp, end = 72.dp, bottom = 100.dp),
        )

        // Progress bar at very bottom
        if (isActive) {
            ClipProgressBar(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 80.dp),
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Top bar overlay
// ────────────────────────────────────────────────────────

@Composable
private fun ClipTopBar(
    isMuted: Boolean,
    isAiMode: Boolean,
    onMuteToggle: () -> Unit,
    onAiModeToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Title
        Text(
            text = "클립",
            style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
            color = Color.White,
        )

        Row(
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            // AI mode toggle
            Box(
                modifier = Modifier
                    .clip(PochakShapes.Full)
                    .background(
                        if (isAiMode) PochakColors.Primary.copy(alpha = 0.3f)
                        else Color.White.copy(alpha = 0.15f),
                    )
                    .clickable(onClick = onAiModeToggle)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
            ) {
                Text(
                    text = "AI",
                    style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.Bold),
                    color = if (isAiMode) PochakColors.Primary else Color.White,
                )
            }

            // Sound toggle
            IconButton(onClick = onMuteToggle) {
                Icon(
                    imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                    contentDescription = if (isMuted) "Unmute" else "Mute",
                    tint = Color.White,
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Right side action buttons
// ────────────────────────────────────────────────────────

@Composable
private fun ClipActionButtons(
    clip: ClipFeedItem,
    modifier: Modifier = Modifier,
) {
    var isLiked by remember { mutableStateOf(clip.isLiked) }
    var likeCount by remember { mutableIntStateOf(clip.likeCount) }

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        // Author avatar
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(PochakColors.SurfaceVariant),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                clip.authorName.take(1),
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextSecondary,
            )
        }

        // Like button
        ClipActionButton(
            icon = if (isLiked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
            label = formatCount(likeCount),
            tint = if (isLiked) PochakColors.LiveRed else Color.White,
            onClick = {
                isLiked = !isLiked
                likeCount = if (isLiked) likeCount + 1 else likeCount - 1
            },
        )

        // Comment button
        ClipActionButton(
            icon = Icons.Outlined.ChatBubbleOutline,
            label = formatCount(clip.commentCount),
            tint = Color.White,
            onClick = { },
        )

        // Share button
        ClipActionButton(
            icon = Icons.Default.Share,
            label = formatCount(clip.shareCount),
            tint = Color.White,
            onClick = { },
        )

        // More button
        ClipActionButton(
            icon = Icons.Default.MoreVert,
            label = "",
            tint = Color.White,
            onClick = { },
        )
    }
}

@Composable
private fun ClipActionButton(
    icon: ImageVector,
    label: String,
    tint: Color,
    onClick: () -> Unit,
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable(onClick = onClick),
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = tint,
            modifier = Modifier.size(28.dp),
        )
        if (label.isNotEmpty()) {
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = label,
                style = PochakTypographyTokens.Overline,
                color = Color.White,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Bottom info overlay
// ────────────────────────────────────────────────────────

@Composable
private fun ClipInfoOverlay(
    clip: ClipFeedItem,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        // Author name
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = "@${clip.authorName}",
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
                color = Color.White,
            )
        }

        // Clip title
        Text(
            text = clip.title,
            style = PochakTypographyTokens.Body02,
            color = Color.White,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )

        // Competition info row
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Icon(
                imageVector = Icons.Default.EmojiEvents,
                contentDescription = null,
                tint = PochakColors.Primary,
                modifier = Modifier.size(14.dp),
            )
            Text(
                text = clip.competitionName,
                style = PochakTypographyTokens.Body04,
                color = Color.White.copy(alpha = 0.7f),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }

        // Like count
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Icon(
                imageVector = Icons.Filled.Favorite,
                contentDescription = null,
                tint = PochakColors.LiveRed,
                modifier = Modifier.size(12.dp),
            )
            Text(
                text = "${formatCount(clip.likeCount)}",
                style = PochakTypographyTokens.Body04,
                color = Color.White.copy(alpha = 0.7f),
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Progress bar
// ────────────────────────────────────────────────────────

@Composable
private fun ClipProgressBar(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "progress")
    val progress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 15000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "clip_progress",
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(3.dp)
            .padding(horizontal = 0.dp),
    ) {
        // Track
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White.copy(alpha = 0.2f)),
        )
        // Progress indicator
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .fillMaxWidth(fraction = progress)
                .background(Color.White),
        )
    }
}

// ────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────

private fun formatCount(count: Int): String {
    return when {
        count >= 10000 -> "${count / 10000}.${(count % 10000) / 1000}만"
        count >= 1000 -> "${count / 1000}.${(count % 1000) / 100}천"
        else -> "$count"
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewClipsScreen() {
    PochakTheme {
        ClipsScreen()
    }
}
