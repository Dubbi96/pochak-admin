package com.pochak.android.ui.screens.mypage

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
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
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.data.model.*
import com.pochak.android.ui.components.*
import com.pochak.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyPageScreen(
    onSearchClick: () -> Unit = {},
    onSettingsClick: () -> Unit = {},
    onLogout: () -> Unit = {},
    onContentClick: (Long) -> Unit = {},
    onMenuHub: () -> Unit = {},
) {
    val profile = SampleData.userProfile
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val tabs = listOf("홈", "시청이력", "내클립", "시청예약", "즐겨찾기")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "My page screen" },
    ) {
        // ── Top Icons Row ──
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 8.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.End,
        ) {
            IconButton(onClick = onSearchClick) {
                Icon(Icons.Default.Search, contentDescription = "Search", tint = PochakColors.TextPrimary)
            }
            IconButton(onClick = { }) {
                Icon(Icons.Default.CalendarMonth, contentDescription = "Calendar", tint = PochakColors.TextPrimary)
            }
            IconButton(onClick = onSettingsClick) {
                Icon(Icons.Default.Menu, contentDescription = "Settings", tint = PochakColors.TextPrimary)
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 24.dp),
        ) {
            // ── Profile Header ──
            item(key = "profile") {
                ProfileHeader(profile = profile)
            }

            // ── Tab Bar ──
            item(key = "tabs") {
                ScrollableTabRow(
                    selectedTabIndex = selectedTabIndex,
                    containerColor = Color.Transparent,
                    contentColor = PochakColors.TextPrimary,
                    edgePadding = 16.dp,
                    indicator = {
                        TabRowDefaults.SecondaryIndicator(
                            color = PochakColors.Primary,
                        )
                    },
                    divider = { HorizontalDivider(color = PochakColors.Border) },
                ) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTabIndex == index,
                            onClick = { selectedTabIndex = index },
                            text = {
                                Text(
                                    text = title,
                                    style = PochakTypographyTokens.Body02.copy(
                                        fontWeight = if (selectedTabIndex == index) FontWeight.SemiBold
                                        else FontWeight.Normal,
                                    ),
                                    color = if (selectedTabIndex == index) PochakColors.TextPrimary
                                    else PochakColors.TextSecondary,
                                )
                            },
                        )
                    }
                }
            }

            // ── Tab Content ──
            when (selectedTabIndex) {
                0 -> {
                    // Home tab content
                    item(key = "sub_banner") {
                        SubscriptionBanner(profile = profile)
                    }
                    item(key = "wallet_grid") {
                        WalletGrid(profile = profile)
                    }
                    item {
                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = PochakColors.Border,
                        )
                    }

                    // Recent watching history
                    item(key = "recent_videos") {
                        SectionHeader(title = "최근 본 영상", onMoreClick = { })
                    }
                    item {
                        RecentVideosRow(onContentClick = onContentClick)
                    }

                    item {
                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = PochakColors.Border,
                        )
                    }

                    // Recent clips
                    item(key = "recent_clips") {
                        SectionHeader(title = "최근 본 클립", onMoreClick = { })
                    }
                    item {
                        RecentClipsRow(onContentClick = onContentClick)
                    }

                    item {
                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = PochakColors.Border,
                        )
                    }

                    // Menu groups
                    item(key = "menus") {
                        MenuGroupsSection(onLogout = onLogout)
                    }
                }

                1 -> {
                    // Watch history - video/clip toggle + list
                    item(key = "history_content") {
                        WatchHistoryContent(onContentClick = onContentClick)
                    }
                }

                2 -> {
                    // My clips - grid
                    item(key = "my_clips") {
                        MyClipsContent(onContentClick = onContentClick)
                    }
                }

                3 -> {
                    // Watch reservations
                    item(key = "reservations") {
                        WatchReservationsContent(onContentClick = onContentClick)
                    }
                }

                4 -> {
                    // Favorites
                    item(key = "favorites") {
                        FavoritesContent(onContentClick = onContentClick)
                    }
                }
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Profile Header
// ────────────────────────────────────────────────────────

@Composable
private fun ProfileHeader(profile: UserProfile) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Avatar
        Box(
            modifier = Modifier
                .size(64.dp)
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
                style = PochakTypographyTokens.Title04,
                color = PochakColors.TextOnPrimary,
            )
        }

        Column(modifier = Modifier.weight(1f)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    text = profile.nickname,
                    style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                )
                Icon(
                    Icons.Default.Edit,
                    contentDescription = "Edit nickname",
                    tint = PochakColors.TextTertiary,
                    modifier = Modifier.size(16.dp),
                )
            }
            Text(
                text = profile.email,
                style = PochakTypographyTokens.Body03,
                color = PochakColors.TextSecondary,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Subscription Banner
// ────────────────────────────────────────────────────────

@Composable
private fun SubscriptionBanner(profile: UserProfile) {
    if (profile.subscriptionName != null) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .clip(PochakShapes.Large)
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(PochakColors.PrimaryDark, PochakColors.Primary),
                    )
                )
                .padding(16.dp),
        ) {
            Column {
                Text(
                    text = profile.subscriptionName!!,
                    style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextOnPrimary,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Next payment: ${profile.nextPaymentDate}",
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextOnPrimary.copy(alpha = 0.8f),
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Wallet Grid (3 columns)
// ────────────────────────────────────────────────────────

@Composable
private fun WalletGrid(profile: UserProfile) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        WalletItem(
            label = "뽈/기프트뽈",
            value = "${profile.polBalance} / ${profile.giftPolBalance}",
            icon = Icons.Outlined.MonetizationOn,
            modifier = Modifier.weight(1f),
        )
        WalletItem(
            label = "이용권",
            value = "${profile.ticketCount}장",
            icon = Icons.Outlined.ConfirmationNumber,
            modifier = Modifier.weight(1f),
        )
        WalletItem(
            label = "선물함",
            value = "${profile.giftBoxCount}개",
            icon = Icons.Outlined.CardGiftcard,
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun WalletItem(
    label: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(PochakShapes.Medium)
            .border(1.dp, PochakColors.Border, PochakShapes.Medium)
            .background(PochakColors.SurfaceVariant)
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = PochakColors.Primary,
            modifier = Modifier.size(24.dp),
        )
        Text(
            text = label,
            style = PochakTypographyTokens.Body04,
            color = PochakColors.TextSecondary,
        )
        Text(
            text = value,
            style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
            color = PochakColors.TextPrimary,
        )
    }
}

// ────────────────────────────────────────────────────────
// Recent Videos Row
// ────────────────────────────────────────────────────────

@Composable
private fun RecentVideosRow(onContentClick: (Long) -> Unit) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(SampleData.videoContents, key = { "recent_v_${it.id}" }) { content ->
            PochakCard(
                onClick = { onContentClick(content.id) },
                modifier = Modifier.width(240.dp),
            ) {
                ContentThumbnail(
                    modifier = Modifier.fillMaxWidth(),
                    contentType = content.type,
                    duration = content.duration,
                )
                Column(modifier = Modifier.padding(10.dp)) {
                    Text(
                        text = content.title,
                        style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.SemiBold),
                        color = PochakColors.TextPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        text = content.competitionName,
                        style = PochakTypographyTokens.Body04,
                        color = PochakColors.TextSecondary,
                        maxLines = 1,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        content.tags.take(3).forEach { tag ->
                            Text(
                                text = tag,
                                style = PochakTypographyTokens.Body04,
                                color = PochakColors.TextTertiary,
                            )
                        }
                    }
                }
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Recent Clips Row
// ────────────────────────────────────────────────────────

@Composable
private fun RecentClipsRow(onContentClick: (Long) -> Unit) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        items(SampleData.clipContents, key = { "recent_c_${it.id}" }) { clip ->
            PochakCard(
                onClick = { onContentClick(clip.id) },
                modifier = Modifier.width(130.dp),
            ) {
                ContentThumbnail(
                    modifier = Modifier.fillMaxWidth(),
                    contentType = ContentType.CLIP,
                    aspectRatio = 4f / 3f,
                )
                Column(modifier = Modifier.padding(8.dp)) {
                    Text(
                        text = clip.title,
                        style = PochakTypographyTokens.Body04,
                        color = PochakColors.TextPrimary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        text = "Views ${clip.viewCount}",
                        style = PochakTypographyTokens.Body04,
                        color = PochakColors.TextTertiary,
                    )
                }
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Menu Groups Section
// ────────────────────────────────────────────────────────

@Composable
private fun MenuGroupsSection(onLogout: () -> Unit) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        MenuGroup(
            title = "Pochak TV",
            items = listOf("시청내역" to Icons.Outlined.History, "내 클립" to Icons.Outlined.ContentCut,
                "구독함" to Icons.Outlined.Subscriptions, "대회권" to Icons.Outlined.EmojiEvents),
        )

        MenuGroup(
            title = "Pochak Club",
            items = listOf("내 클럽" to Icons.Outlined.Groups, "관심 클럽" to Icons.Outlined.FavoriteBorder,
                "커뮤니티" to Icons.Outlined.Forum),
        )

        MenuGroup(
            title = "Pochak City",
            items = listOf("대회 소식" to Icons.Outlined.Campaign, "시설 예약" to Icons.Outlined.LocationOn,
                "자주가는 시설" to Icons.Outlined.Bookmark),
        )

        MenuGroup(
            title = "Service",
            items = listOf("공지사항" to Icons.Outlined.Announcement, "고객센터" to Icons.Outlined.ContactSupport),
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Logout
        PochakButton(
            text = "로그아웃",
            onClick = onLogout,
            style = PochakButtonStyle.GHOST,
        )

        Spacer(modifier = Modifier.height(8.dp))
    }
}

@Composable
private fun MenuGroup(
    title: String,
    items: List<Pair<String, ImageVector>>,
) {
    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        Text(
            text = title,
            style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
            color = PochakColors.Primary,
            modifier = Modifier.padding(vertical = 8.dp),
        )
        items.forEach { (label, icon) ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { }
                    .padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = PochakColors.TextSecondary,
                    modifier = Modifier.size(20.dp),
                )
                Text(
                    text = label,
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.TextPrimary,
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Tab Contents: Watch History, My Clips, Reservations, Favorites
// ────────────────────────────────────────────────────────

@Composable
private fun WatchHistoryContent(onContentClick: (Long) -> Unit) {
    var showVideos by remember { mutableStateOf(true) }

    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
        // Video/Clip toggle
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = showVideos,
                onClick = { showVideos = true },
                label = { Text("영상") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = PochakColors.TextPrimary,
                    selectedLabelColor = PochakColors.Background,
                    containerColor = Color.Transparent,
                    labelColor = PochakColors.TextSecondary,
                ),
                border = FilterChipDefaults.filterChipBorder(
                    borderColor = PochakColors.BorderLight,
                    selectedBorderColor = Color.Transparent,
                    enabled = true,
                    selected = showVideos,
                ),
            )
            FilterChip(
                selected = !showVideos,
                onClick = { showVideos = false },
                label = { Text("클립") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = PochakColors.TextPrimary,
                    selectedLabelColor = PochakColors.Background,
                    containerColor = Color.Transparent,
                    labelColor = PochakColors.TextSecondary,
                ),
                border = FilterChipDefaults.filterChipBorder(
                    borderColor = PochakColors.BorderLight,
                    selectedBorderColor = Color.Transparent,
                    enabled = true,
                    selected = !showVideos,
                ),
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (showVideos) {
            SampleData.videoContents.forEach { content ->
                VideoListItem(content = content, onClick = { onContentClick(content.id) })
            }
        } else {
            ClipGridContent(onContentClick = onContentClick)
        }
    }
}

@Composable
private fun VideoListItem(content: VideoContent, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        ContentThumbnail(
            modifier = Modifier.width(140.dp),
            contentType = content.type,
            duration = content.duration,
        )
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(3.dp),
        ) {
            Text(
                text = content.title,
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = content.competitionName,
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                content.tags.take(3).forEach { tag ->
                    Text(text = tag, style = PochakTypographyTokens.Body04, color = PochakColors.TextTertiary)
                }
            }
            Text(text = content.date, style = PochakTypographyTokens.Body04, color = PochakColors.TextTertiary)
        }
        Icon(
            Icons.Default.MoreVert,
            contentDescription = "More options",
            tint = PochakColors.TextTertiary,
            modifier = Modifier.size(20.dp),
        )
    }
}

@Composable
private fun ClipGridContent(onContentClick: (Long) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SampleData.clipContents.chunked(2).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                row.forEach { clip ->
                    PochakCard(
                        onClick = { onContentClick(clip.id) },
                        modifier = Modifier.weight(1f),
                    ) {
                        ContentThumbnail(
                            modifier = Modifier.fillMaxWidth(),
                            contentType = ContentType.CLIP,
                            aspectRatio = 4f / 3f,
                        )
                        Column(modifier = Modifier.padding(8.dp)) {
                            Text(
                                text = clip.title,
                                style = PochakTypographyTokens.Body04,
                                color = PochakColors.TextPrimary,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                            )
                            Text(
                                text = "Views ${clip.viewCount}",
                                style = PochakTypographyTokens.Body04,
                                color = PochakColors.TextTertiary,
                            )
                        }
                    }
                }
                // Fill remaining space if odd count
                if (row.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun MyClipsContent(onContentClick: (Long) -> Unit) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
        ClipGridContent(onContentClick = onContentClick)
    }
}

@Composable
private fun WatchReservationsContent(onContentClick: (Long) -> Unit) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
        // Group by date
        Text(
            text = "2026.01.01 | D-Day",
            style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
            color = PochakColors.TextPrimary,
            modifier = Modifier.padding(vertical = 8.dp),
        )
        SampleData.videoContents.forEach { content ->
            VideoListItem(content = content, onClick = { onContentClick(content.id) })
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "2026.01.02 | D+1",
            style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
            color = PochakColors.TextPrimary,
            modifier = Modifier.padding(vertical = 8.dp),
        )
        SampleData.videoContents.take(2).forEach { content ->
            VideoListItem(content = content, onClick = { onContentClick(content.id) })
        }
    }
}

@Composable
private fun FavoritesContent(onContentClick: (Long) -> Unit) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
        // Favorite competitions
        SectionHeader(title = "즐겨찾는 대회", onMoreClick = { })
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(3) { index ->
                PochakCard(
                    onClick = { },
                    modifier = Modifier.width(200.dp),
                ) {
                    ContentThumbnail(modifier = Modifier.fillMaxWidth())
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "6th MLB Cup Little Baseball U10",
                            style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.SemiBold),
                            color = PochakColors.TextPrimary,
                            maxLines = 1,
                        )
                        Text(
                            text = "2026 | 01.01 ~ 02.01",
                            style = PochakTypographyTokens.Body04,
                            color = PochakColors.TextTertiary,
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Favorite teams/clubs
        SectionHeader(title = "즐겨찾는 팀/클럽", onMoreClick = { })
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(4) { index ->
                Column(
                    modifier = Modifier.width(80.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(PochakColors.SurfaceVariant),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("T", color = PochakColors.TextTertiary, style = PochakTypographyTokens.Body01)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Dongdaemun Little",
                        style = PochakTypographyTokens.Body04,
                        color = PochakColors.TextPrimary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    )
                    Text(
                        text = "Baseball | U10",
                        style = PochakTypographyTokens.Body04,
                        color = PochakColors.TextTertiary,
                        maxLines = 1,
                    )
                }
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewMyPageScreen() {
    PochakTheme {
        MyPageScreen()
    }
}
