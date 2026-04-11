package com.pochak.android.ui.screens.search

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.data.model.*
import com.pochak.android.ui.components.*
import com.pochak.android.ui.theme.*

// ════════════════════════════════════════════════════════════
// SearchScreen
// ════════════════════════════════════════════════════════════

@Composable
fun SearchScreen(
    onBackClick: () -> Unit = {},
    onContentClick: (Long) -> Unit = {},
) {
    var query by remember { mutableStateOf("") }
    val focusRequester = remember { FocusRequester() }
    var selectedTab by remember { mutableIntStateOf(0) }

    val tabs = listOf("전체", "팀", "클럽", "라이브", "대회", "영상", "클립")

    val hasQuery = query.isNotBlank()

    // Sample filtered results
    val filteredVideos = remember(query) {
        if (!hasQuery) SampleData.videoContents
        else SampleData.videoContents.filter {
            it.title.contains(query, ignoreCase = true) ||
                it.competitionName.contains(query, ignoreCase = true) ||
                it.tags.any { tag -> tag.contains(query, ignoreCase = true) }
        }
    }
    val filteredTeams = remember(query) {
        if (!hasQuery) SampleData.teamClubs
        else SampleData.teamClubs.filter {
            it.name.contains(query, ignoreCase = true) ||
                it.sportType.contains(query, ignoreCase = true)
        }
    }
    val filteredCompetitions = remember(query) {
        if (!hasQuery) SampleData.competitions
        else SampleData.competitions.filter {
            it.name.contains(query, ignoreCase = true) ||
                it.sportType.contains(query, ignoreCase = true)
        }
    }
    val filteredClips = remember(query) {
        if (!hasQuery) SampleData.clipContents
        else SampleData.clipContents.filter {
            it.title.contains(query, ignoreCase = true)
        }
    }
    val filteredLive = remember(query) {
        if (!hasQuery) SampleData.liveContents
        else SampleData.liveContents.filter {
            it.teamHome.contains(query, ignoreCase = true) ||
                it.teamAway.contains(query, ignoreCase = true) ||
                it.competitionName.contains(query, ignoreCase = true)
        }
    }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Search screen" },
    ) {
        // ── Search Bar ──
        SearchBarSection(
            query = query,
            onQueryChange = { query = it },
            onBackClick = onBackClick,
            focusRequester = focusRequester,
        )

        // ── Tab Bar ──
        SearchTabBar(
            tabs = tabs,
            selectedIndex = selectedTab,
            onTabSelected = { selectedTab = it },
        )

        // ── Tab Content ──
        when (selectedTab) {
            0 -> AllTabContent(
                teams = filteredTeams,
                clubs = filteredTeams, // reusing teams as clubs for demo
                liveContents = filteredLive,
                competitions = filteredCompetitions,
                videos = filteredVideos,
                clips = filteredClips,
                onContentClick = onContentClick,
            )
            1 -> TeamTabContent(teams = filteredTeams)
            2 -> ClubTabContent(clubs = filteredTeams)
            3 -> LiveTabContent(liveContents = filteredLive, onContentClick = onContentClick)
            4 -> CompetitionTabContent(competitions = filteredCompetitions, onContentClick = onContentClick)
            5 -> VideoTabContent(videos = filteredVideos, onContentClick = onContentClick)
            6 -> ClipTabContent(clips = filteredClips, onContentClick = onContentClick)
        }
    }
}

// ════════════════════════════════════════════════════════════
// Search Bar
// ════════════════════════════════════════════════════════════

@Composable
private fun SearchBarSection(
    query: String,
    onQueryChange: (String) -> Unit,
    onBackClick: () -> Unit,
    focusRequester: FocusRequester,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 8.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBackClick) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "뒤로가기",
                tint = PochakColors.TextPrimary,
            )
        }

        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            modifier = Modifier
                .weight(1f)
                .focusRequester(focusRequester),
            placeholder = {
                Text(
                    "검색",
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.TextTertiary,
                )
            },
            leadingIcon = {
                Icon(
                    Icons.Default.Search,
                    contentDescription = null,
                    tint = PochakColors.TextTertiary,
                )
            },
            trailingIcon = {
                if (query.isNotBlank()) {
                    IconButton(onClick = { onQueryChange("") }) {
                        Icon(
                            Icons.Default.Clear,
                            contentDescription = "검색어 삭제",
                            tint = PochakColors.TextTertiary,
                        )
                    }
                } else {
                    IconButton(onClick = { /* voice search */ }) {
                        Icon(
                            Icons.Default.Mic,
                            contentDescription = "음성 검색",
                            tint = PochakColors.TextTertiary,
                        )
                    }
                }
            },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = PochakColors.TextPrimary,
                unfocusedTextColor = PochakColors.TextPrimary,
                cursorColor = PochakColors.Primary,
                focusedBorderColor = PochakColors.Primary,
                unfocusedBorderColor = PochakColors.BorderLight,
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
            ),
            shape = PochakShapes.SearchBar,
            textStyle = PochakTypographyTokens.Body02.copy(color = PochakColors.TextPrimary),
            singleLine = true,
        )
    }
}

// ════════════════════════════════════════════════════════════
// Search Tab Bar
// ════════════════════════════════════════════════════════════

@Composable
private fun SearchTabBar(
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
// All Tab Content (전체)
// ════════════════════════════════════════════════════════════

@Composable
private fun AllTabContent(
    teams: List<TeamClub>,
    clubs: List<TeamClub>,
    liveContents: List<LiveContent>,
    competitions: List<CompetitionInfo>,
    videos: List<VideoContent>,
    clips: List<ClipContent>,
    onContentClick: (Long) -> Unit,
) {
    LazyColumn(
        contentPadding = PaddingValues(bottom = 24.dp),
    ) {
        // ── 팀 > ──
        if (teams.isNotEmpty()) {
            item(key = "team_header") {
                SectionHeader(title = "팀", onMoreClick = { })
            }
            item(key = "team_row") {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    items(teams, key = { "team_${it.id}" }) { team ->
                        CircularTeamItem(team = team)
                    }
                }
            }
        }

        // ── 클럽 > ──
        if (clubs.isNotEmpty()) {
            item(key = "club_header") {
                SectionHeader(title = "클럽", onMoreClick = { })
            }
            item(key = "club_row") {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(clubs, key = { "club_${it.id}" }) { club ->
                        SquareClubItem(club = club)
                    }
                }
            }
        }

        // ── 라이브 > ──
        if (liveContents.isNotEmpty()) {
            item(key = "live_header") {
                SectionHeader(title = "라이브", onMoreClick = { })
            }
            item(key = "live_row") {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(liveContents, key = { "live_${it.id}" }) { live ->
                        LiveCardItem(live = live, onClick = { onContentClick(live.id) })
                    }
                }
            }
        }

        // ── 대회 > ──
        if (competitions.isNotEmpty()) {
            item(key = "comp_header") {
                SectionHeader(title = "대회", onMoreClick = { })
            }
            item(key = "comp_row") {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(competitions, key = { "comp_${it.id}" }) { comp ->
                        CompetitionBannerItem(competition = comp, onClick = { onContentClick(comp.id) })
                    }
                }
            }
        }

        // ── 영상 > ──
        if (videos.isNotEmpty()) {
            item(key = "video_header") {
                SectionHeader(title = "영상", onMoreClick = { })
            }
            items(
                items = videos,
                key = { "video_${it.id}" },
            ) { content ->
                SearchVideoListItem(content = content, onClick = { onContentClick(content.id) })
            }
        }

        // ── 클립 > ── (3-column grid)
        if (clips.isNotEmpty()) {
            item(key = "clip_header") {
                SectionHeader(title = "클립", onMoreClick = { })
            }
            item(key = "clip_grid") {
                SearchClipGrid(clips = clips, onClipClick = onContentClick)
            }
        }
    }
}

// ════════════════════════════════════════════════════════════
// Team Tab (expanded)
// ════════════════════════════════════════════════════════════

@Composable
private fun TeamTabContent(teams: List<TeamClub>) {
    if (teams.isEmpty()) {
        EmptySearchState("팀 검색 결과가 없습니다")
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(teams, key = { "team_full_${it.id}" }) { team ->
            TeamListItem(team = team)
        }
    }
}

// ════════════════════════════════════════════════════════════
// Club Tab (expanded)
// ════════════════════════════════════════════════════════════

@Composable
private fun ClubTabContent(clubs: List<TeamClub>) {
    if (clubs.isEmpty()) {
        EmptySearchState("클럽 검색 결과가 없습니다")
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(clubs, key = { "club_full_${it.id}" }) { club ->
            ClubListItem(club = club)
        }
    }
}

// ════════════════════════════════════════════════════════════
// Live Tab (expanded)
// ════════════════════════════════════════════════════════════

@Composable
private fun LiveTabContent(
    liveContents: List<LiveContent>,
    onContentClick: (Long) -> Unit,
) {
    if (liveContents.isEmpty()) {
        EmptySearchState("라이브 검색 결과가 없습니다")
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(vertical = 8.dp),
    ) {
        items(liveContents, key = { "live_full_${it.id}" }) { live ->
            LiveListItem(live = live, onClick = { onContentClick(live.id) })
        }
    }
}

// ════════════════════════════════════════════════════════════
// Competition Tab (expanded)
// ════════════════════════════════════════════════════════════

@Composable
private fun CompetitionTabContent(
    competitions: List<CompetitionInfo>,
    onContentClick: (Long) -> Unit,
) {
    if (competitions.isEmpty()) {
        EmptySearchState("대회 검색 결과가 없습니다")
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(competitions, key = { "comp_full_${it.id}" }) { comp ->
            CompetitionExpandedItem(competition = comp, onClick = { onContentClick(comp.id) })
        }
    }
}

// ════════════════════════════════════════════════════════════
// Video Tab (expanded)
// ════════════════════════════════════════════════════════════

@Composable
private fun VideoTabContent(
    videos: List<VideoContent>,
    onContentClick: (Long) -> Unit,
) {
    if (videos.isEmpty()) {
        EmptySearchState("영상 검색 결과가 없습니다")
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(vertical = 8.dp),
    ) {
        items(
            items = videos,
            key = { "video_full_${it.id}" },
        ) { content ->
            SearchVideoListItem(content = content, onClick = { onContentClick(content.id) })
        }
    }
}

// ════════════════════════════════════════════════════════════
// Clip Tab (expanded 3-column grid)
// ════════════════════════════════════════════════════════════

@Composable
private fun ClipTabContent(
    clips: List<ClipContent>,
    onContentClick: (Long) -> Unit,
) {
    if (clips.isEmpty()) {
        EmptySearchState("클립 검색 결과가 없습니다")
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
    ) {
        item(key = "clip_grid_full") {
            SearchClipGrid(clips = clips, onClipClick = onContentClick)
        }
    }
}

// ════════════════════════════════════════════════════════════
// Shared UI Components
// ════════════════════════════════════════════════════════════

@Composable
private fun CircularTeamItem(team: TeamClub) {
    Column(
        modifier = Modifier.width(72.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(PochakColors.SurfaceVariant)
                .border(1.dp, PochakColors.BorderLight, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = team.name.take(2),
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextSecondary,
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = team.name,
            style = PochakTypographyTokens.Body04,
            color = PochakColors.TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            text = "${team.sportType} | ${team.division}",
            style = PochakTypographyTokens.Overline,
            color = PochakColors.TextTertiary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun SquareClubItem(club: TeamClub) {
    Column(
        modifier = Modifier.width(80.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(68.dp)
                .clip(PochakShapes.Medium)
                .background(PochakColors.SurfaceVariant)
                .border(1.dp, PochakColors.BorderLight, PochakShapes.Medium),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = club.name.take(2),
                style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextSecondary,
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = club.name,
            style = PochakTypographyTokens.Body04,
            color = PochakColors.TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            text = "${club.sportType} | 서울 강남구",
            style = PochakTypographyTokens.Overline,
            color = PochakColors.TextTertiary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun LiveCardItem(
    live: LiveContent,
    onClick: () -> Unit,
) {
    PochakCard(
        onClick = onClick,
        modifier = Modifier.width(200.dp),
    ) {
        Box {
            ContentThumbnail(
                modifier = Modifier.fillMaxWidth(),
                contentType = ContentType.LIVE,
            )
            // "01/01 예정" badge
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .background(
                        PochakColors.Overlay,
                        PochakShapes.Small,
                    )
                    .padding(horizontal = 6.dp, vertical = 2.dp),
            ) {
                Text(
                    text = "01/01 예정",
                    style = PochakTypographyTokens.Overline,
                    color = Color.White,
                )
            }
        }
        Column(modifier = Modifier.padding(8.dp)) {
            Text(
                text = "${live.teamHome} vs ${live.teamAway}",
                style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = live.competitionName,
                style = PochakTypographyTokens.Overline,
                color = PochakColors.TextTertiary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun CompetitionBannerItem(
    competition: CompetitionInfo,
    onClick: () -> Unit,
) {
    PochakCard(
        onClick = onClick,
        modifier = Modifier.width(240.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp)
                .background(
                    brush = androidx.compose.ui.graphics.Brush.horizontalGradient(
                        colors = listOf(
                            PochakColors.Primary.copy(alpha = 0.3f),
                            PochakColors.SurfaceVariant,
                        ),
                    ),
                ),
            contentAlignment = Alignment.CenterStart,
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
            ) {
                Text(
                    text = competition.name,
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = competition.dateRange,
                    style = PochakTypographyTokens.Body04,
                    color = PochakColors.TextSecondary,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    competition.tags.take(3).forEach { tag ->
                        Box(
                            modifier = Modifier
                                .clip(PochakShapes.Chip)
                                .background(PochakColors.Primary.copy(alpha = 0.15f))
                                .padding(horizontal = 6.dp, vertical = 2.dp),
                        ) {
                            Text(
                                text = "#$tag",
                                style = PochakTypographyTokens.Overline,
                                color = PochakColors.Primary,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SearchVideoListItem(
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
        ContentThumbnail(
            modifier = Modifier.width(140.dp),
            contentType = content.type,
            duration = content.duration,
        )
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
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                content.tags.take(3).forEach { tag ->
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
    }
}

@Composable
private fun SearchClipGrid(
    clips: List<ClipContent>,
    onClipClick: (Long) -> Unit,
) {
    val rows = clips.chunked(3)
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        rows.forEach { rowClips ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
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
                        Spacer(modifier = Modifier.height(4.dp))
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
                // Fill remaining space for incomplete rows
                repeat(3 - rowClips.size) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

// ── Extended list items for individual tabs ──

@Composable
private fun TeamListItem(team: TeamClub) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(PochakShapes.Medium)
            .background(PochakColors.Card)
            .clickable { }
            .padding(12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(PochakColors.SurfaceVariant)
                .border(1.dp, PochakColors.BorderLight, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = team.name.take(2),
                style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextSecondary,
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = team.name,
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextPrimary,
            )
            Text(
                text = "${team.sportType} | ${team.division}",
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextTertiary,
            )
        }
        Icon(
            Icons.Default.ChevronRight,
            contentDescription = null,
            tint = PochakColors.TextTertiary,
            modifier = Modifier.size(20.dp),
        )
    }
}

@Composable
private fun ClubListItem(club: TeamClub) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(PochakShapes.Medium)
            .background(PochakColors.Card)
            .clickable { }
            .padding(12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(PochakShapes.Base)
                .background(PochakColors.SurfaceVariant)
                .border(1.dp, PochakColors.BorderLight, PochakShapes.Base),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = club.name.take(2),
                style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextSecondary,
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = club.name,
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextPrimary,
            )
            Text(
                text = "${club.sportType} | 서울 강남구",
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextTertiary,
            )
        }
        Icon(
            Icons.Default.ChevronRight,
            contentDescription = null,
            tint = PochakColors.TextTertiary,
            modifier = Modifier.size(20.dp),
        )
    }
}

@Composable
private fun LiveListItem(
    live: LiveContent,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        ContentThumbnail(
            modifier = Modifier.width(150.dp),
            contentType = ContentType.LIVE,
        )
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = "${live.teamHome} vs ${live.teamAway}",
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = live.competitionName,
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                PochakBadge(type = ContentType.LIVE)
                Text(
                    text = "시청자 ${live.viewerCount}명",
                    style = PochakTypographyTokens.Overline,
                    color = PochakColors.TextTertiary,
                )
            }
        }
    }
}

@Composable
private fun CompetitionExpandedItem(
    competition: CompetitionInfo,
    onClick: () -> Unit,
) {
    PochakCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .background(
                    brush = androidx.compose.ui.graphics.Brush.horizontalGradient(
                        colors = listOf(
                            PochakColors.Primary.copy(alpha = 0.2f),
                            PochakColors.SurfaceVariant,
                        ),
                    ),
                ),
            contentAlignment = Alignment.CenterStart,
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = competition.name,
                    style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = competition.dateRange,
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextSecondary,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    competition.tags.forEach { tag ->
                        Box(
                            modifier = Modifier
                                .clip(PochakShapes.Chip)
                                .border(1.dp, PochakColors.Primary, PochakShapes.Chip)
                                .padding(horizontal = 8.dp, vertical = 3.dp),
                        ) {
                            Text(
                                text = "#$tag",
                                style = PochakTypographyTokens.Body04,
                                color = PochakColors.Primary,
                            )
                        }
                    }
                }
            }
        }
    }
}

// ════════════════════════════════════════════════════════════
// Empty State
// ════════════════════════════════════════════════════════════

@Composable
private fun EmptySearchState(message: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(48.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                Icons.Default.Search,
                contentDescription = null,
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(48.dp),
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = message,
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextSecondary,
            )
        }
    }
}

// ════════════════════════════════════════════════════════════
// Preview
// ════════════════════════════════════════════════════════════

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewSearchScreen() {
    PochakTheme {
        SearchScreen()
    }
}
