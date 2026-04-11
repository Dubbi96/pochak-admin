package com.pochak.android.ui.screens.player

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pochak.android.data.model.*
import com.pochak.android.ui.components.*
import com.pochak.android.ui.theme.*

// ════════════════════════════════════════════════════════════
// PlayerScreen
// ════════════════════════════════════════════════════════════

@Composable
fun PlayerScreen(
    contentId: Long = 1L,
    onBackClick: () -> Unit = {},
    onClipClick: (Long) -> Unit = {},
) {
    val matchInfo = remember {
        MatchInfo(
            id = contentId,
            homeTeam = "동대문구 리틀야구",
            awayTeam = "군포시 리틀야구",
            homeTeamLogo = "",
            awayTeamLogo = "",
            competitionName = "6회 MLB컵 리틀야구 U10",
            date = "2026.01.01",
            round = "준결승",
            tags = listOf("야구", "유료", "해설", "MLB", "동대문구리틀야구", "군포시리틀야구"),
        )
    }

    var showControls by remember { mutableStateOf(true) }
    var isPlaying by remember { mutableStateOf(false) }
    var isFullscreen by remember { mutableStateOf(false) }
    var isVideoEnded by remember { mutableStateOf(false) }
    var isLiked by remember { mutableStateOf(false) }
    var likeCount by remember { mutableIntStateOf(100) }
    var selectedContentTab by remember { mutableIntStateOf(0) }
    var selectedCameraTab by remember { mutableIntStateOf(0) }
    var descriptionExpanded by remember { mutableStateOf(false) }
    var selectedRelatedToggle by remember { mutableIntStateOf(0) } // 0=영상, 1=클립
    var progress by remember { mutableFloatStateOf(0f) }

    val contentTabs = listOf("추천영상", "관련영상", "내클립")
    val cameraTabs = listOf("AI", "PANO", "SIDE A", "CAM")
    val filterTags = listOf("#야구", "#유료", "#해설", "#MLB", "#동대문리틀야구")

    if (isFullscreen) {
        FullscreenPlayerLayout(
            showControls = showControls,
            isPlaying = isPlaying,
            progress = progress,
            onToggleControls = { showControls = !showControls },
            onTogglePlay = { isPlaying = !isPlaying },
            onExitFullscreen = { isFullscreen = false },
            onBackClick = onBackClick,
        )
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Player screen" },
    ) {
        // ── Video Area (16:9) ──
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .background(Color.Black)
                .clickable { showControls = !showControls },
        ) {
            if (isVideoEnded) {
                VideoEndedOverlay(
                    onReplay = { isVideoEnded = false; isPlaying = true },
                )
            } else {
                // Placeholder for ExoPlayer surface
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "VIDEO PLAYER",
                        style = PochakTypographyTokens.Title04,
                        color = PochakColors.TextTertiary,
                    )
                }

                // LIVE/VOD Badge top-left
                PochakBadge(
                    type = ContentType.VOD,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(12.dp),
                )
            }

            // Controls overlay
            androidx.compose.animation.AnimatedVisibility(
                visible = showControls && !isVideoEnded,
                enter = fadeIn(tween(200)),
                exit = fadeOut(tween(300)),
            ) {
                VideoControlsOverlay(
                    isPlaying = isPlaying,
                    progress = progress,
                    onBackClick = onBackClick,
                    onTogglePlay = { isPlaying = !isPlaying },
                    onSeekBack = { progress = (progress - 0.05f).coerceAtLeast(0f) },
                    onSeekForward = { progress = (progress + 0.05f).coerceAtMost(1f) },
                    onFullscreen = { isFullscreen = true },
                    onProgressChange = { progress = it },
                )
            }
        }

        // ── Camera View Strip ──
        CameraViewStrip(
            tabs = cameraTabs,
            selectedIndex = selectedCameraTab,
            onTabSelected = { selectedCameraTab = it },
        )

        // ── Scrollable content below video ──
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 24.dp),
        ) {
            // Match/Content Info
            item(key = "match_title") {
                MatchContentInfoSection(
                    matchInfo = matchInfo,
                    descriptionExpanded = descriptionExpanded,
                    onToggleDescription = { descriptionExpanded = !descriptionExpanded },
                )
            }

            // Action row
            item(key = "actions") {
                PlayerActionRow(
                    homeTeam = matchInfo.homeTeam,
                    isLiked = isLiked,
                    likeCount = likeCount,
                    onLikeClick = {
                        isLiked = !isLiked
                        likeCount += if (isLiked) 1 else -1
                    },
                )
            }

            item(key = "divider_1") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 4.dp),
                    thickness = 1.dp,
                    color = PochakColors.Border,
                )
            }

            // Content tabs: 추천영상 | 관련영상 | 내클립
            item(key = "content_tabs") {
                ContentTabBar(
                    tabs = contentTabs,
                    selectedIndex = selectedContentTab,
                    onTabSelected = { selectedContentTab = it },
                )
            }

            // Filter tag chips (scrollable)
            item(key = "filter_tags") {
                FilterTagRow(tags = filterTags)
            }

            // Tab content
            when (selectedContentTab) {
                0 -> { // 추천영상
                    items(
                        items = SampleData.videoContents,
                        key = { "rec_${it.id}" },
                    ) { content ->
                        VideoListItem(
                            content = content,
                            onClick = { },
                        )
                    }
                }

                1 -> { // 관련영상
                    item(key = "related_toggle") {
                        RelatedContentToggle(
                            selectedIndex = selectedRelatedToggle,
                            onToggle = { selectedRelatedToggle = it },
                        )
                    }

                    if (selectedRelatedToggle == 0) {
                        // 영상 list
                        items(
                            items = SampleData.videoContents,
                            key = { "related_video_${it.id}" },
                        ) { content ->
                            VideoListItem(
                                content = content,
                                onClick = { },
                            )
                        }
                    } else {
                        // 클립 2-column grid (inside LazyColumn item)
                        item(key = "related_clips_grid") {
                            ClipGrid(
                                clips = SampleData.clipContents,
                                onClipClick = onClipClick,
                            )
                        }
                    }
                }

                2 -> { // 내클립
                    item(key = "my_clips_grid") {
                        ClipGrid(
                            clips = SampleData.clipContents,
                            onClipClick = onClipClick,
                        )
                    }
                }
            }
        }
    }
}

// ════════════════════════════════════════════════════════════
// Video Controls Overlay
// ════════════════════════════════════════════════════════════

@Composable
private fun VideoControlsOverlay(
    isPlaying: Boolean,
    progress: Float,
    onBackClick: () -> Unit,
    onTogglePlay: () -> Unit,
    onSeekBack: () -> Unit,
    onSeekForward: () -> Unit,
    onFullscreen: () -> Unit,
    onProgressChange: (Float) -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Overlay),
    ) {
        // ── Top row ──
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopCenter)
                .statusBarsPadding()
                .padding(horizontal = 4.dp, vertical = 2.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Left: Back button
            IconButton(onClick = onBackClick) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "뒤로가기",
                    tint = Color.White,
                )
            }
            // Right: Clip, PIP, Timeline, Settings
            Row {
                OverlayIconButton(Icons.Default.ContentCut, "클립 만들기")
                OverlayIconButton(Icons.Default.PictureInPicture, "PIP")
                OverlayIconButton(Icons.Default.ViewTimeline, "타임라인")
                OverlayIconButton(Icons.Default.Settings, "설정")
            }
        }

        // ── Center: Seek + Play/Pause ──
        Row(
            modifier = Modifier.align(Alignment.Center),
            horizontalArrangement = Arrangement.spacedBy(40.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // -10s Seek
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.15f))
                    .clickable { onSeekBack() },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Default.Replay10,
                    contentDescription = "10초 되감기",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp),
                )
            }

            // Play/Pause
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.2f))
                    .clickable { onTogglePlay() },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = if (isPlaying) "일시정지" else "재생",
                    tint = Color.White,
                    modifier = Modifier.size(44.dp),
                )
            }

            // +10s Seek
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.15f))
                    .clickable { onSeekForward() },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Default.Forward10,
                    contentDescription = "10초 앞으로",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp),
                )
            }
        }

        // ── Bottom: progress + time + buttons ──
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(horizontal = 12.dp, vertical = 6.dp),
        ) {
            // Progress bar (green fill)
            Slider(
                value = progress,
                onValueChange = onProgressChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(24.dp),
                colors = SliderDefaults.colors(
                    thumbColor = PochakColors.Primary,
                    activeTrackColor = PochakColors.Primary,
                    inactiveTrackColor = Color.White.copy(alpha = 0.3f),
                ),
            )

            // Time row + clip/full buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // Time display
                Text(
                    text = formatTime(progress) + " / 01:30:00",
                    style = PochakTypographyTokens.Body04,
                    color = Color.White,
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    // "클립" button
                    Box(
                        modifier = Modifier
                            .clip(PochakShapes.Small)
                            .background(Color.White.copy(alpha = 0.2f))
                            .clickable { }
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                    ) {
                        Text(
                            text = "클립",
                            style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.SemiBold),
                            color = Color.White,
                        )
                    }
                    // "전체" button
                    Box(
                        modifier = Modifier
                            .clip(PochakShapes.Small)
                            .background(Color.White.copy(alpha = 0.2f))
                            .clickable { }
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                    ) {
                        Text(
                            text = "전체",
                            style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.SemiBold),
                            color = Color.White,
                        )
                    }

                    // Fullscreen button
                    IconButton(
                        onClick = onFullscreen,
                        modifier = Modifier.size(32.dp),
                    ) {
                        Icon(
                            Icons.Default.Fullscreen,
                            contentDescription = "전체화면",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun OverlayIconButton(
    icon: ImageVector,
    description: String,
    onClick: () -> Unit = {},
) {
    IconButton(onClick = onClick, modifier = Modifier.size(40.dp)) {
        Icon(
            icon,
            contentDescription = description,
            tint = Color.White,
            modifier = Modifier.size(22.dp),
        )
    }
}

// ════════════════════════════════════════════════════════════
// Video Ended Overlay
// ════════════════════════════════════════════════════════════

@Composable
private fun VideoEndedOverlay(onReplay: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Overlay),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.2f))
                    .clickable { onReplay() },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Default.PlayArrow,
                    contentDescription = "다시 재생",
                    tint = Color.White,
                    modifier = Modifier.size(40.dp),
                )
            }
            Text(
                text = "다음영상 재생",
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = Color.White,
            )
        }
    }
}

// ════════════════════════════════════════════════════════════
// Camera View Strip
// ════════════════════════════════════════════════════════════

@Composable
private fun CameraViewStrip(
    tabs: List<String>,
    selectedIndex: Int,
    onTabSelected: (Int) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(PochakColors.BackgroundVariant)
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        tabs.forEachIndexed { index, label ->
            val isSelected = index == selectedIndex
            Box(
                modifier = Modifier
                    .clip(PochakShapes.Small)
                    .background(
                        if (isSelected) PochakColors.Primary
                        else PochakColors.SurfaceVariant,
                    )
                    .clickable { onTabSelected(index) }
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = label,
                    style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.SemiBold),
                    color = if (isSelected) PochakColors.TextOnPrimary else PochakColors.TextSecondary,
                )
            }
        }
    }
}

// ════════════════════════════════════════════════════════════
// Match/Content Info Section
// ════════════════════════════════════════════════════════════

@Composable
private fun MatchContentInfoSection(
    matchInfo: MatchInfo,
    descriptionExpanded: Boolean,
    onToggleDescription: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        // Title (large, bold)
        Text(
            text = "${matchInfo.homeTeam} vs ${matchInfo.awayTeam}",
            style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
            color = PochakColors.TextPrimary,
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Competition + round + date
        Text(
            text = "${matchInfo.competitionName} | ${matchInfo.round} | ${matchInfo.date}",
            style = PochakTypographyTokens.Body03,
            color = PochakColors.TextSecondary,
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Tags row (horizontal scroll, green border chips)
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            matchInfo.tags.forEach { tag ->
                Box(
                    modifier = Modifier
                        .clip(PochakShapes.Chip)
                        .border(1.dp, PochakColors.Primary, PochakShapes.Chip)
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                ) {
                    Text(
                        text = "#$tag",
                        style = PochakTypographyTokens.Body04,
                        color = PochakColors.Primary,
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Description (expandable)
        val descriptionText = "동대문구 리틀야구 팀과 군포시 리틀야구 팀이 6회 MLB컵 리틀야구 U10 준결승에서 맞붙습니다. " +
            "양 팀 모두 시즌 최고의 기량을 보여주고 있으며, 결승 진출을 위한 치열한 경기가 예상됩니다. " +
            "해설과 함께 경기를 즐겨보세요."

        Text(
            text = descriptionText,
            style = PochakTypographyTokens.Body03,
            color = PochakColors.TextSecondary,
            maxLines = if (descriptionExpanded) Int.MAX_VALUE else 2,
            overflow = TextOverflow.Ellipsis,
        )

        if (!descriptionExpanded) {
            Text(
                text = "더보기",
                modifier = Modifier
                    .clickable { onToggleDescription() }
                    .padding(top = 4.dp),
                style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextTertiary,
            )
        } else {
            Text(
                text = "접기",
                modifier = Modifier
                    .clickable { onToggleDescription() }
                    .padding(top = 4.dp),
                style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextTertiary,
            )
        }
    }
}

// ════════════════════════════════════════════════════════════
// Player Action Row
// ════════════════════════════════════════════════════════════

@Composable
private fun PlayerActionRow(
    homeTeam: String,
    isLiked: Boolean,
    likeCount: Int,
    onLikeClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // 즐겨찾기 button (team logo + text)
        Row(
            modifier = Modifier
                .clip(PochakShapes.Chip)
                .border(1.dp, PochakColors.BorderLight, PochakShapes.Chip)
                .clickable { }
                .padding(horizontal = 12.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(PochakColors.SurfaceVariant),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = homeTeam.first().toString(),
                    style = PochakTypographyTokens.Overline,
                    color = PochakColors.TextTertiary,
                )
            }
            Text(
                text = "즐겨찾기",
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
            )
        }

        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Like
            PlayerActionButton(
                icon = if (isLiked) Icons.Filled.ThumbUp else Icons.Default.ThumbUpOffAlt,
                label = likeCount.toString(),
                tint = if (isLiked) PochakColors.Primary else PochakColors.TextSecondary,
                onClick = onLikeClick,
            )
            // Share
            PlayerActionButton(
                icon = Icons.Default.Share,
                label = "공유",
                onClick = { },
            )
            // More
            PlayerActionButton(
                icon = Icons.Default.MoreHoriz,
                label = "더보기",
                onClick = { },
            )
        }
    }
}

@Composable
private fun PlayerActionButton(
    icon: ImageVector,
    label: String,
    tint: Color = PochakColors.TextSecondary,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = tint,
            modifier = Modifier.size(22.dp),
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = label,
            style = PochakTypographyTokens.Overline,
            color = PochakColors.TextTertiary,
        )
    }
}

// ════════════════════════════════════════════════════════════
// Content Tab Bar (추천영상 | 관련영상 | 내클립)
// ════════════════════════════════════════════════════════════

@Composable
private fun ContentTabBar(
    tabs: List<String>,
    selectedIndex: Int,
    onTabSelected: (Int) -> Unit,
) {
    ScrollableTabRow(
        selectedTabIndex = selectedIndex,
        modifier = Modifier.fillMaxWidth(),
        containerColor = Color.Transparent,
        contentColor = PochakColors.TextPrimary,
        edgePadding = 16.dp,
        indicator = { tabPositions ->
            if (selectedIndex < tabPositions.size) {
                val currentTabPosition = tabPositions[selectedIndex]
                TabRowDefaults.SecondaryIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .wrapContentSize(Alignment.CenterStart)
                        .offset(x = currentTabPosition.left)
                        .width(currentTabPosition.width),
                    height = 2.dp,
                    color = PochakColors.Primary,
                )
            }
        },
        divider = {
            HorizontalDivider(thickness = 1.dp, color = PochakColors.Border)
        },
    ) {
        tabs.forEachIndexed { index, title ->
            Tab(
                selected = selectedIndex == index,
                onClick = { onTabSelected(index) },
                text = {
                    Text(
                        text = title,
                        style = PochakTypographyTokens.Body02.copy(
                            fontWeight = if (selectedIndex == index) FontWeight.Bold else FontWeight.Normal,
                        ),
                    )
                },
                selectedContentColor = PochakColors.TextPrimary,
                unselectedContentColor = PochakColors.TextTertiary,
            )
        }
    }
}

// ════════════════════════════════════════════════════════════
// Filter Tag Row
// ════════════════════════════════════════════════════════════

@Composable
private fun FilterTagRow(tags: List<String>) {
    var selectedIndex by remember { mutableIntStateOf(-1) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        tags.forEachIndexed { index, tag ->
            val isSelected = index == selectedIndex
            Box(
                modifier = Modifier
                    .clip(PochakShapes.Chip)
                    .background(
                        if (isSelected) PochakColors.Primary.copy(alpha = 0.15f)
                        else Color.Transparent,
                    )
                    .border(
                        width = 1.dp,
                        color = if (isSelected) PochakColors.Primary else PochakColors.BorderLight,
                        shape = PochakShapes.Chip,
                    )
                    .clickable { selectedIndex = if (isSelected) -1 else index }
                    .padding(horizontal = 12.dp, vertical = 6.dp),
            ) {
                Text(
                    text = tag,
                    style = PochakTypographyTokens.Body04,
                    color = if (isSelected) PochakColors.Primary else PochakColors.TextSecondary,
                )
            }
        }
    }
}

// ════════════════════════════════════════════════════════════
// Related Content Toggle (영상 / 클립 + Sort)
// ════════════════════════════════════════════════════════════

@Composable
private fun RelatedContentToggle(
    selectedIndex: Int,
    onToggle: (Int) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Toggle: 영상 / 클립
        Row(
            modifier = Modifier
                .clip(PochakShapes.Base)
                .background(PochakColors.SurfaceVariant),
        ) {
            listOf("영상", "클립").forEachIndexed { index, label ->
                val isSelected = index == selectedIndex
                Box(
                    modifier = Modifier
                        .clip(PochakShapes.Base)
                        .background(
                            if (isSelected) PochakColors.Primary else Color.Transparent,
                        )
                        .clickable { onToggle(index) }
                        .padding(horizontal = 20.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = label,
                        style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.SemiBold),
                        color = if (isSelected) PochakColors.TextOnPrimary else PochakColors.TextSecondary,
                    )
                }
            }
        }

        // Sort button
        Row(
            modifier = Modifier
                .clip(PochakShapes.Small)
                .clickable { }
                .padding(horizontal = 8.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                Icons.Default.SwapVert,
                contentDescription = "정렬",
                tint = PochakColors.TextSecondary,
                modifier = Modifier.size(16.dp),
            )
            Text(
                text = "인기순",
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
            )
        }
    }
}

// ════════════════════════════════════════════════════════════
// Video List Item
// ════════════════════════════════════════════════════════════

@Composable
private fun VideoListItem(
    content: VideoContent,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Thumbnail (16:9 with duration)
        ContentThumbnail(
            modifier = Modifier.width(150.dp),
            contentType = content.type,
            duration = content.duration,
        )

        // Info column
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = content.title,
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            // Sport type
            Text(
                text = content.tags.firstOrNull() ?: "",
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextTertiary,
            )
            // Competition logo + name
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(14.dp)
                        .clip(CircleShape)
                        .background(PochakColors.SurfaceVariant),
                )
                Text(
                    text = content.competitionName,
                    style = PochakTypographyTokens.Body04,
                    color = PochakColors.TextSecondary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            // Tags + date
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                content.tags.take(2).forEach { tag ->
                    Text(
                        text = "#$tag",
                        style = PochakTypographyTokens.Overline,
                        color = PochakColors.Primary.copy(alpha = 0.7f),
                    )
                }
                Text(
                    text = content.date,
                    style = PochakTypographyTokens.Overline,
                    color = PochakColors.TextTertiary,
                )
            }
        }

        // More button
        IconButton(
            onClick = { },
            modifier = Modifier
                .size(28.dp)
                .align(Alignment.Top),
        ) {
            Icon(
                Icons.Default.MoreVert,
                contentDescription = "더보기",
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(18.dp),
            )
        }
    }
}

// ════════════════════════════════════════════════════════════
// Clip Grid (2 columns)
// ════════════════════════════════════════════════════════════

@Composable
private fun ClipGrid(
    clips: List<ClipContent>,
    onClipClick: (Long) -> Unit,
) {
    // Non-lazy grid inside LazyColumn
    val rows = clips.chunked(2)
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        rows.forEach { rowClips ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                rowClips.forEach { clip ->
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onClipClick(clip.id) },
                    ) {
                        ContentThumbnail(
                            modifier = Modifier.fillMaxWidth(),
                            contentType = ContentType.CLIP,
                            aspectRatio = 3f / 4f,
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = clip.title,
                            style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.Medium),
                            color = PochakColors.TextPrimary,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Text(
                            text = "조회수 ${clip.viewCount}",
                            style = PochakTypographyTokens.Overline,
                            color = PochakColors.TextTertiary,
                        )
                    }
                }
                // Fill remaining space if odd number
                if (rowClips.size < 2) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

// ════════════════════════════════════════════════════════════
// Fullscreen Landscape Layout
// ════════════════════════════════════════════════════════════

@Composable
private fun FullscreenPlayerLayout(
    showControls: Boolean,
    isPlaying: Boolean,
    progress: Float,
    onToggleControls: () -> Unit,
    onTogglePlay: () -> Unit,
    onExitFullscreen: () -> Unit,
    onBackClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .clickable { onToggleControls() },
    ) {
        // Video placeholder
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "FULLSCREEN PLAYER",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextTertiary,
            )
        }

        AnimatedVisibility(
            visible = showControls,
            enter = fadeIn(tween(200)),
            exit = fadeOut(tween(300)),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(PochakColors.Overlay),
            ) {
                // Top bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter)
                        .statusBarsPadding()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "뒤로",
                            tint = Color.White,
                        )
                    }

                    // Page title (vertical text style)
                    Text(
                        text = "페이지명",
                        style = PochakTypographyTokens.Body03,
                        color = Color.White.copy(alpha = 0.7f),
                    )
                }

                // Center controls
                Row(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalArrangement = Arrangement.spacedBy(48.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.15f))
                            .clickable { },
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            Icons.Default.Replay10,
                            contentDescription = "10초 되감기",
                            tint = Color.White,
                            modifier = Modifier.size(36.dp),
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f))
                            .clickable { onTogglePlay() },
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = if (isPlaying) "일시정지" else "재생",
                            tint = Color.White,
                            modifier = Modifier.size(52.dp),
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.15f))
                            .clickable { },
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            Icons.Default.Forward10,
                            contentDescription = "10초 앞으로",
                            tint = Color.White,
                            modifier = Modifier.size(36.dp),
                        )
                    }
                }

                // Right side toolbar (clip, PIP, timeline, settings)
                Column(
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .padding(end = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    FullscreenSideButton(Icons.Default.ContentCut, "클립")
                    FullscreenSideButton(Icons.Default.PictureInPicture, "PIP")
                    FullscreenSideButton(Icons.Default.ViewTimeline, "타임라인")
                    FullscreenSideButton(Icons.Default.Settings, "설정")
                }

                // Bottom seek bar + time
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .navigationBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                ) {
                    Slider(
                        value = progress,
                        onValueChange = { },
                        modifier = Modifier.fillMaxWidth(),
                        colors = SliderDefaults.colors(
                            thumbColor = PochakColors.Primary,
                            activeTrackColor = PochakColors.Primary,
                            inactiveTrackColor = Color.White.copy(alpha = 0.3f),
                        ),
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = formatTime(progress) + " / 01:30:00",
                            style = PochakTypographyTokens.Body04,
                            color = Color.White,
                        )

                        IconButton(
                            onClick = onExitFullscreen,
                            modifier = Modifier.size(32.dp),
                        ) {
                            Icon(
                                Icons.Default.FullscreenExit,
                                contentDescription = "전체화면 종료",
                                tint = Color.White,
                                modifier = Modifier.size(24.dp),
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FullscreenSideButton(icon: ImageVector, label: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { },
    ) {
        Icon(
            icon,
            contentDescription = label,
            tint = Color.White,
            modifier = Modifier.size(24.dp),
        )
        Text(
            text = label,
            style = PochakTypographyTokens.Overline,
            color = Color.White.copy(alpha = 0.8f),
        )
    }
}

// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════

private fun formatTime(progress: Float): String {
    val totalSeconds = (progress * 5400).toInt() // 01:30:00 = 5400 seconds
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    return "%02d:%02d:%02d".format(hours, minutes, seconds)
}

// ════════════════════════════════════════════════════════════
// Preview
// ════════════════════════════════════════════════════════════

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewPlayerScreen() {
    PochakTheme {
        PlayerScreen()
    }
}

@Preview(showBackground = true, widthDp = 800, heightDp = 400)
@Composable
private fun PreviewFullscreenPlayer() {
    PochakTheme {
        FullscreenPlayerLayout(
            showControls = true,
            isPlaying = false,
            progress = 0.3f,
            onToggleControls = {},
            onTogglePlay = {},
            onExitFullscreen = {},
            onBackClick = {},
        )
    }
}
