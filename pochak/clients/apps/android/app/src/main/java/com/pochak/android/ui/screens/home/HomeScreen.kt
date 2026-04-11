package com.pochak.android.ui.screens.home

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pochak.android.data.model.*
import com.pochak.android.ui.components.*
import com.pochak.android.ui.theme.*
import com.pochak.android.R
import androidx.compose.foundation.Image
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import kotlinx.coroutines.delay

// ════════════════════════════════════════════════════════
// HomeScreen  --  포착TV main tab (Figma spec)
// ════════════════════════════════════════════════════════

@Composable
fun HomeScreen(
    onContentClick: (Long) -> Unit = {},
    onSearchClick: () -> Unit = {},
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background),
    ) {
        // ── TopBar (fixed, 50dp) ──
        HomeTopBar(onSearchClick = onSearchClick)

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 24.dp),
        ) {
            // ── 1. Banner_Main (square 1:1) ──
            item(key = "banner_main") {
                BannerMain(banners = SampleData.banners)
            }

            // ── 2. Banner_Competition (pager + dots) ──
            item(key = "banner_competition") {
                BannerCompetition(competitions = SampleData.competitions)
            }

            // ── 3. 공식 LIVE ──
            item(key = "official_live") {
                HomeSectionHeader(title = "공식 LIVE", onMoreClick = { })
            }
            item {
                OfficialLiveRow(
                    liveContents = SampleData.liveContents,
                    onContentClick = onContentClick,
                )
            }

            // ── 4. 인기 클립 ──
            item(key = "popular_clips_header") {
                HomeSectionHeader(title = "인기 클립", onMoreClick = { })
            }
            item(key = "popular_clips") {
                PopularClipsRow(
                    clips = SampleData.clipContents,
                    onClipClick = { onContentClick(it) },
                )
            }

            // ── 5. 최근 영상 ──
            item(key = "recent_videos_header") {
                HomeSectionHeader(title = "최근 영상", onMoreClick = { })
            }
            itemsIndexed(
                items = SampleData.videoContents,
                key = { _, item -> "recent_${item.id}" },
            ) { index, content ->
                StaggeredAnimatedItem(index = index) {
                    RecentVideoRow(
                        content = content,
                        onClick = { onContentClick(content.id) },
                    )
                }
            }

            // ── 6. 인기 팀/클럽 ──
            item(key = "popular_teams_header") {
                HomeSectionHeader(title = "인기 팀/클럽", onMoreClick = { })
            }
            item(key = "popular_teams") {
                PopularTeamsRow(
                    teams = SampleData.teamClubs,
                    onTeamClick = { },
                )
            }

            // ── 7. 팀/클럽 라이브 ──
            item(key = "team_live_header") {
                HomeSectionHeader(title = "팀/클럽 라이브", onMoreClick = { })
            }
            itemsIndexed(
                items = SampleData.liveContents.take(2),
                key = { _, item -> "team_live_${item.id}" },
            ) { index, live ->
                StaggeredAnimatedItem(index = index) {
                    RecentVideoRow(
                        content = VideoContent(
                            id = live.id,
                            thumbnailUrl = live.thumbnailUrl,
                            title = "${live.teamHome} vs ${live.teamAway}",
                            competitionName = live.competitionName,
                            competitionLogoUrl = "",
                            date = "2026.01.01",
                            type = ContentType.LIVE,
                            tags = listOf("야구", "유료", "해설"),
                            duration = "",
                        ),
                        onClick = { onContentClick(live.id) },
                    )
                }
            }

            // ── 8. 팀/클럽 클립 ──
            item(key = "team_clips_header") {
                HomeSectionHeader(title = "팀/클럽 클립", onMoreClick = { })
            }
            item(key = "team_clips") {
                PopularClipsRow(
                    clips = SampleData.clipContents,
                    onClipClick = { onContentClick(it) },
                )
            }

            // ── 9. Competition VOD Section ──
            item(key = "competition_section") {
                CompetitionVodSection(
                    competition = SampleData.competitions.first(),
                    videos = SampleData.videoContents,
                    onContentClick = onContentClick,
                )
            }
        }
    }
}

// ════════════════════════════════════════════════════════
// TopBar_Index  (50dp, bg #1A1A1A)
// ════════════════════════════════════════════════════════

@Composable
private fun HomeTopBar(onSearchClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(50.dp)
            .background(Color(0xFF1A1A1A))
            .padding(horizontal = 15.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Left: Symbol + "TV" + dropdown
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            modifier = Modifier.weight(1f),
        ) {
            // Pochak symbol placeholder (27x30)
            Box(
                modifier = Modifier
                    .width(27.dp)
                    .height(30.dp)
                    .background(PochakColors.Primary, RoundedCornerShape(4.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "P",
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.ExtraBold),
                    color = Color.Black,
                )
            }
            Text(
                text = "TV",
                style = PochakTypographyTokens.Body02.copy(
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp,
                ),
                color = Color.White,
            )
            Icon(
                imageVector = Icons.Default.ArrowDropDown,
                contentDescription = "Channel selector",
                tint = Color.White,
                modifier = Modifier.size(20.dp),
            )
        }

        // Right: Shop | Reservation | Search | Hamburger
        Row(
            horizontalArrangement = Arrangement.spacedBy(15.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            // Shop icon (30x20)
            Icon(
                imageVector = Icons.Outlined.Tv,
                contentDescription = "Shop",
                tint = Color.White,
                modifier = Modifier
                    .width(30.dp)
                    .height(20.dp)
                    .clickable { },
            )
            // Reservation icon (24x20)
            Icon(
                imageVector = Icons.Outlined.CalendarMonth,
                contentDescription = "Reservation",
                tint = Color.White,
                modifier = Modifier
                    .width(24.dp)
                    .height(20.dp)
                    .clickable { },
            )
            // Search icon (20x20)
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search",
                tint = Color.White,
                modifier = Modifier
                    .size(20.dp)
                    .clickable(onClick = onSearchClick),
            )
            // Hamburger menu (20x20)
            Icon(
                imageVector = Icons.Default.Menu,
                contentDescription = "Menu",
                tint = Color.White,
                modifier = Modifier
                    .size(20.dp)
                    .clickable { },
            )
        }
    }
}

// ════════════════════════════════════════════════════════
// 1. Banner_Main  (square 1:1, full bleed)
// ════════════════════════════════════════════════════════

@Composable
private fun BannerMain(banners: List<BannerItem>) {
    val pagerState = rememberPagerState(pageCount = { banners.size })

    LaunchedEffect(pagerState) {
        while (true) {
            delay(5000)
            val next = (pagerState.currentPage + 1) % banners.size
            pagerState.animateScrollToPage(next)
        }
    }

    HorizontalPager(
        state = pagerState,
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f),
    ) { page ->
        val banner = banners[page]
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(PochakColors.SurfaceVariant),
        ) {
            // Banner image
            Image(
                painter = painterResource(id = R.drawable.image),
                contentDescription = banner.title,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )

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

            // Title + subtitle at bottom-left (25sp SemiBold, 15sp Regular)
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(start = 15.dp, bottom = 50.dp, end = 80.dp),
            ) {
                Text(
                    text = banner.title,
                    style = PochakTypographyTokens.Title03.copy(
                        fontSize = 25.sp,
                        fontWeight = FontWeight.SemiBold,
                    ),
                    color = Color.White.copy(alpha = 0.95f),
                    maxLines = 2,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = banner.subtitle,
                    style = PochakTypographyTokens.Body02.copy(fontSize = 15.sp),
                    color = Color.White.copy(alpha = 0.95f),
                    maxLines = 2,
                )
            }

            // Page counter "1 / n" (cornerRadius 10, 60% black bg, 45x30)
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 15.dp, bottom = 15.dp)
                    .width(45.dp)
                    .height(30.dp)
                    .background(
                        Color.Black.copy(alpha = 0.6f),
                        RoundedCornerShape(10.dp),
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "${page + 1} / ${banners.size}",
                    style = PochakTypographyTokens.Body03.copy(
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                    ),
                    color = Color.White.copy(alpha = 0.95f),
                )
            }
        }
    }
}

// ════════════════════════════════════════════════════════
// 2. Banner_Competition  (pager card + dot indicators)
// ════════════════════════════════════════════════════════

@Composable
private fun BannerCompetition(competitions: List<CompetitionInfo>) {
    if (competitions.isEmpty()) return

    val pagerState = rememberPagerState(pageCount = { competitions.size })

    Column(modifier = Modifier.padding(top = 15.dp)) {
        HorizontalPager(
            state = pagerState,
            contentPadding = PaddingValues(horizontal = 15.dp),
            pageSpacing = 10.dp,
            modifier = Modifier.fillMaxWidth(),
        ) { page ->
            val comp = competitions[page]
            // Card: bg #262626, cornerRadius 10, height 100dp
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp)
                    .background(
                        Color(0xFF262626),
                        RoundedCornerShape(10.dp),
                    )
                    .clip(RoundedCornerShape(10.dp))
                    .clickable { },
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // Thumbnail placeholder (140x70)
                Box(
                    modifier = Modifier
                        .padding(start = 15.dp)
                        .width(140.dp)
                        .height(70.dp)
                        .background(PochakColors.SurfaceVariant, RoundedCornerShape(6.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("P", color = PochakColors.TextTertiary.copy(alpha = 0.3f), style = PochakTypographyTokens.Title04)
                }

                // Info texts
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(start = 15.dp, end = 15.dp),
                    verticalArrangement = Arrangement.spacedBy(0.dp),
                ) {
                    // Name: 15sp SemiBold white
                    Text(
                        text = comp.name,
                        style = PochakTypographyTokens.Body02.copy(
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                        ),
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    // Tag: 13sp Regular #A6A6A6
                    Text(
                        text = "${comp.sportType} | ${comp.tags.firstOrNull() ?: ""}",
                        style = PochakTypographyTokens.Body03.copy(fontSize = 13.sp),
                        color = Color(0xFFA6A6A6),
                        maxLines = 1,
                    )
                    // Date: 13sp Regular #00CC33
                    Text(
                        text = comp.dateRange,
                        style = PochakTypographyTokens.Body03.copy(fontSize = 13.sp),
                        color = PochakColors.Primary,
                        maxLines = 1,
                    )
                }
            }
        }

        // Dot indicators (7dp, white selected / #4D4D4D unselected)
        Spacer(modifier = Modifier.height(10.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
        ) {
            repeat(competitions.size.coerceAtMost(5)) { index ->
                val isActive = index == pagerState.currentPage
                Box(
                    modifier = Modifier
                        .padding(horizontal = 5.dp)
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(if (isActive) Color.White else Color(0xFF4D4D4D)),
                )
            }
        }
        Spacer(modifier = Modifier.height(10.dp))
    }
}

// ════════════════════════════════════════════════════════
// Section Header (45dp, 20sp SemiBold + ">" arrow)
// ════════════════════════════════════════════════════════

@Composable
private fun HomeSectionHeader(
    title: String,
    onMoreClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(45.dp)
            .padding(horizontal = 15.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = title,
            style = PochakTypographyTokens.Title04.copy(
                fontSize = 20.sp,
                fontWeight = FontWeight.SemiBold,
            ),
            color = Color.White,
            modifier = Modifier.weight(1f),
        )
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = "More",
            tint = PochakColors.TextSecondary,
            modifier = Modifier
                .size(20.dp)
                .clickable(onClick = onMoreClick),
        )
    }
}

// ════════════════════════════════════════════════════════
// 3. Card_Video_Major (공식 LIVE section)
// ════════════════════════════════════════════════════════

@Composable
private fun OfficialLiveRow(
    liveContents: List<LiveContent>,
    onContentClick: (Long) -> Unit,
) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 15.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        items(items = liveContents, key = { it.id }) { live ->
            CardVideoMajor(
                live = live,
                onClick = { onContentClick(live.id) },
            )
        }
    }
    Spacer(modifier = Modifier.height(8.dp))
}

@Composable
private fun CardVideoMajor(
    live: LiveContent,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .width(240.dp)
            .clickable(onClick = onClick),
    ) {
        // Thumbnail: 240x144, cornerRadius 10
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(144.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(PochakColors.SurfaceVariant),
        ) {
            // Center placeholder
            Text(
                text = "P",
                modifier = Modifier.align(Alignment.Center),
                color = PochakColors.TextTertiary.copy(alpha = 0.2f),
                style = PochakTypographyTokens.Title03,
            )

            // 3 team circle avatars overlapping at center
            Row(
                modifier = Modifier.align(Alignment.Center),
                horizontalArrangement = Arrangement.spacedBy((-10).dp),
            ) {
                repeat(3) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.4f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(PochakColors.SurfaceVariant),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text("T", color = PochakColors.TextTertiary, style = PochakTypographyTokens.Body03)
                        }
                    }
                }
            }

            // Badge bottom-left: "라이브" (11sp SemiBold white on #E51728, cornerRadius 5)
            Box(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(5.dp)
                    .background(PochakColors.BadgeLive, RoundedCornerShape(5.dp))
                    .padding(horizontal = 5.dp),
            ) {
                Text(
                    text = "라이브",
                    style = PochakTypographyTokens.Body04.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        lineHeight = 20.sp,
                    ),
                    color = Color.White,
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Title row: 15sp SemiBold white + meatball
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "${live.teamHome} vs ${live.teamAway}",
                style = PochakTypographyTokens.Body02.copy(
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                ),
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f),
            )
            Icon(
                imageVector = Icons.Default.MoreVert,
                contentDescription = "More",
                tint = Color.White,
                modifier = Modifier.size(20.dp),
            )
        }

        // Competition: icon + name 13sp SemiBold #00CC33
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(5.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(PochakColors.SurfaceVariant),
                contentAlignment = Alignment.Center,
            ) {
                Text("P", style = PochakTypographyTokens.Overline, color = PochakColors.TextTertiary)
            }
            Text(
                text = live.competitionName,
                style = PochakTypographyTokens.Body03.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                ),
                color = PochakColors.Primary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }

        // Meta: 13sp Regular #A6A6A6
        Text(
            text = "여자부 1라운드 | 2026.01.01",
            style = PochakTypographyTokens.Body03.copy(fontSize = 13.sp),
            color = Color(0xFFA6A6A6),
            maxLines = 1,
        )

        // Tags: 13sp Regular #A6A6A6
        Text(
            text = "#야구 #정규리그 #인천삼산월드체육관",
            style = PochakTypographyTokens.Body03.copy(fontSize = 13.sp),
            color = Color(0xFFA6A6A6),
            maxLines = 1,
        )
    }
}

// ════════════════════════════════════════════════════════
// 4. 인기 클립 Row
// ════════════════════════════════════════════════════════

@Composable
private fun PopularClipsRow(
    clips: List<ClipContent>,
    onClipClick: (Long) -> Unit,
) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 15.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        items(items = clips, key = { "clip_${it.id}" }) { clip ->
            PopularClipCard(
                clip = clip,
                onClick = { onClipClick(clip.id) },
            )
        }
    }
    Spacer(modifier = Modifier.height(8.dp))
}

@Composable
private fun PopularClipCard(
    clip: ClipContent,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .width(110.dp)
            .clickable(onClick = onClick),
    ) {
        Box {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(PochakColors.SurfaceVariant),
                contentAlignment = Alignment.Center,
            ) {
                Text("P", color = PochakColors.TextTertiary.copy(alpha = 0.2f), style = PochakTypographyTokens.Title04)
            }
            // Meatball top-end
            Icon(
                imageVector = Icons.Default.MoreVert,
                contentDescription = "More",
                tint = Color.White,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(4.dp)
                    .size(18.dp),
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = clip.title,
            style = PochakTypographyTokens.Body04,
            color = Color.White,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = "조회수 ${clip.viewCount}",
            style = PochakTypographyTokens.Overline,
            color = Color(0xFFA6A6A6),
        )
    }
}

// ════════════════════════════════════════════════════════
// 5. 최근 영상 / 팀 라이브 Row
// ════════════════════════════════════════════════════════

@Composable
private fun RecentVideoRow(
    content: VideoContent,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 15.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(modifier = Modifier.width(150.dp)) {
            ContentThumbnail(
                modifier = Modifier.fillMaxWidth(),
                contentType = content.type,
                duration = content.duration,
            )
        }
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            // Title: 15sp SemiBold
            Text(
                text = content.title,
                style = PochakTypographyTokens.Body02.copy(
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                ),
                color = Color.White,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            // Competition: 13sp SemiBold green
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(20.dp)
                        .clip(CircleShape)
                        .background(PochakColors.SurfaceVariant),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("P", style = PochakTypographyTokens.Overline, color = PochakColors.TextTertiary)
                }
                Text(
                    text = content.competitionName,
                    style = PochakTypographyTokens.Body03.copy(
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                    ),
                    color = PochakColors.Primary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            // Meta: 13sp Regular #A6A6A6
            Text(
                text = content.tags.joinToString(" | ") + " | " + content.date,
                style = PochakTypographyTokens.Body03.copy(fontSize = 13.sp),
                color = Color(0xFFA6A6A6),
                maxLines = 1,
            )
            // Tags
            Text(
                text = content.tags.joinToString(" ") { "#$it" },
                style = PochakTypographyTokens.Body03.copy(fontSize = 13.sp),
                color = Color(0xFFA6A6A6),
                maxLines = 1,
            )
        }
        Icon(
            imageVector = Icons.Default.MoreVert,
            contentDescription = "More",
            tint = Color.White,
            modifier = Modifier.size(20.dp),
        )
    }
}

// ════════════════════════════════════════════════════════
// 6. 인기 팀/클럽 Row
// ════════════════════════════════════════════════════════

@Composable
private fun PopularTeamsRow(
    teams: List<TeamClub>,
    onTeamClick: (Long) -> Unit,
) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 15.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        items(items = teams, key = { it.id }) { team ->
            Column(
                modifier = Modifier
                    .width(72.dp)
                    .clickable { onTeamClick(team.id) },
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(PochakColors.SurfaceVariant),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = team.name.take(1),
                        style = PochakTypographyTokens.Title04,
                        color = PochakColors.TextTertiary,
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = team.name,
                    style = PochakTypographyTokens.Body04,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    textAlign = TextAlign.Center,
                )
                Text(
                    text = "${team.sportType} | ${team.division}",
                    style = PochakTypographyTokens.Overline,
                    color = Color(0xFFA6A6A6),
                    maxLines = 1,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
    Spacer(modifier = Modifier.height(8.dp))
}

// ════════════════════════════════════════════════════════
// 9. Competition VOD Section
// ════════════════════════════════════════════════════════

@Composable
private fun CompetitionVodSection(
    competition: CompetitionInfo,
    videos: List<VideoContent>,
    onContentClick: (Long) -> Unit,
) {
    Column {
        HomeSectionHeader(title = competition.name, onMoreClick = { })

        // Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 15.dp)
                .height(120.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(PochakColors.SurfaceVariant),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.7f)),
                            startY = 40f,
                        )
                    ),
            )
            Text(
                text = "P",
                modifier = Modifier.align(Alignment.Center),
                color = PochakColors.TextTertiary.copy(alpha = 0.2f),
                style = PochakTypographyTokens.Title02,
            )
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(12.dp),
            ) {
                Text(
                    text = competition.name,
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
                    color = Color.White,
                )
                Text(
                    text = competition.dateRange,
                    style = PochakTypographyTokens.Overline,
                    color = Color(0xFFA6A6A6),
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        videos.forEach { video ->
            RecentVideoRow(
                content = video,
                onClick = { onContentClick(video.id) },
            )
        }
    }
}

// ════════════════════════════════════════════════════════
// Staggered Animation Wrapper
// ════════════════════════════════════════════════════════

@Composable
private fun StaggeredAnimatedItem(
    index: Int,
    content: @Composable () -> Unit,
) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        delay(index * 80L)
        visible = true
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(tween(400)) + slideInVertically(
            initialOffsetY = { 30 },
            animationSpec = tween(400, easing = EaseOutCubic),
        ),
    ) {
        content()
    }
}

// ════════════════════════════════════════════════════════
// Preview
// ════════════════════════════════════════════════════════

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewHomeScreen() {
    PochakTheme {
        HomeScreen()
    }
}
