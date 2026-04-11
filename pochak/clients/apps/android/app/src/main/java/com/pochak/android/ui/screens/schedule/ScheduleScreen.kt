package com.pochak.android.ui.screens.schedule

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
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
import kotlinx.coroutines.delay

// ════════════════════════════════════════════════════════
// ScheduleScreen  --  일정 tab
// ════════════════════════════════════════════════════════

private data class SportTab(
    val label: String,
    val isDefault: Boolean = false,
)

private val sportTabs = listOf(
    SportTab("이달의대회", isDefault = true),
    SportTab("#축구"),
    SportTab("#야구"),
    SportTab("#배구"),
    SportTab("#핸드볼"),
    SportTab("#농구"),
    SportTab("#수영"),
    SportTab("#육상"),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScheduleScreen(
    onContentClick: (Long) -> Unit = {},
    onSearchClick: () -> Unit = {},
) {
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    var selectedYear by remember { mutableIntStateOf(2026) }
    var selectedMonth by remember { mutableIntStateOf(1) }

    Scaffold(
        modifier = Modifier
            .nestedScroll(scrollBehavior.nestedScrollConnection)
            .semantics { contentDescription = "Schedule screen" },
        containerColor = PochakColors.Background,
        topBar = {
            ScheduleTopBar(
                scrollBehavior = scrollBehavior,
                onSearchClick = onSearchClick,
            )
        },
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
        ) {
            // ── Sport Tabs ──
            SportTabBar(
                tabs = sportTabs,
                selectedIndex = selectedTabIndex,
                onTabSelected = { selectedTabIndex = it },
            )

            // ── Year/Month Selector ──
            YearMonthSelector(
                year = selectedYear,
                month = selectedMonth,
                onYearChange = { selectedYear = it },
                onMonthChange = { selectedMonth = it },
            )

            // ── Content Area ──
            when (selectedTabIndex) {
                0 -> {
                    // 이달의대회 tab
                    CompetitionsTab(
                        competitions = SampleData.competitions,
                        onCompetitionClick = { },
                    )
                }
                else -> {
                    // Sport-specific tab (match list)
                    MatchListTab(
                        competitions = SampleData.competitions.take(2),
                        matches = SampleData.matches,
                        onContentClick = onContentClick,
                    )
                }
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// ScheduleTopBar
// ────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ScheduleTopBar(
    scrollBehavior: TopAppBarScrollBehavior,
    onSearchClick: () -> Unit,
) {
    TopAppBar(
        title = {
            Text(
                text = "일정",
                style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextPrimary,
            )
        },
        actions = {
            IconButton(onClick = onSearchClick) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = PochakColors.TextPrimary,
                )
            }
            IconButton(onClick = { }) {
                Icon(
                    imageVector = Icons.Default.GridView,
                    contentDescription = "Multiview",
                    tint = PochakColors.TextPrimary,
                )
            }
            IconButton(onClick = { }) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Menu",
                    tint = PochakColors.TextPrimary,
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = PochakColors.Background,
            scrolledContainerColor = PochakColors.Surface,
            titleContentColor = PochakColors.TextPrimary,
        ),
        scrollBehavior = scrollBehavior,
    )
}

// ────────────────────────────────────────────────────────
// Sport Tab Bar (scrollable)
// ────────────────────────────────────────────────────────

@Composable
private fun SportTabBar(
    tabs: List<SportTab>,
    selectedIndex: Int,
    onTabSelected: (Int) -> Unit,
) {
    val scrollState = rememberScrollState()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(scrollState)
            .background(PochakColors.Background)
            .padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        tabs.forEachIndexed { index, tab ->
            val isSelected = index == selectedIndex
            Column(
                modifier = Modifier
                    .clickable { onTabSelected(index) }
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = tab.label,
                    style = PochakTypographyTokens.Body02.copy(
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    ),
                    color = if (isSelected) PochakColors.Primary else PochakColors.TextSecondary,
                )
                Spacer(modifier = Modifier.height(4.dp))
                // Underline indicator
                Box(
                    modifier = Modifier
                        .width(if (isSelected) 40.dp else 0.dp)
                        .height(2.dp)
                        .background(
                            if (isSelected) PochakColors.Primary else Color.Transparent,
                            PochakShapes.Full,
                        ),
                )
            }
        }
    }

    HorizontalDivider(thickness = 1.dp, color = PochakColors.Border)
}

// ────────────────────────────────────────────────────────
// Year/Month Selector
// ────────────────────────────────────────────────────────

@Composable
private fun YearMonthSelector(
    year: Int,
    month: Int,
    onYearChange: (Int) -> Unit,
    onMonthChange: (Int) -> Unit,
) {
    var yearExpanded by remember { mutableStateOf(false) }
    var monthExpanded by remember { mutableStateOf(false) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        // Year chip
        Box {
            Row(
                modifier = Modifier
                    .clickable { yearExpanded = true }
                    .background(PochakColors.Card, PochakShapes.Base)
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = "${year}년",
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                    color = PochakColors.TextPrimary,
                )
                Icon(
                    imageVector = Icons.Default.ArrowDropDown,
                    contentDescription = "Select year",
                    tint = PochakColors.TextSecondary,
                    modifier = Modifier.size(18.dp),
                )
            }
            DropdownMenu(
                expanded = yearExpanded,
                onDismissRequest = { yearExpanded = false },
                modifier = Modifier.background(PochakColors.Card),
            ) {
                (2024..2027).forEach { y ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                "${y}년",
                                color = if (y == year) PochakColors.Primary else PochakColors.TextPrimary,
                                style = PochakTypographyTokens.Body02,
                            )
                        },
                        onClick = {
                            onYearChange(y)
                            yearExpanded = false
                        },
                    )
                }
            }
        }

        // Month chip
        Box {
            Row(
                modifier = Modifier
                    .clickable { monthExpanded = true }
                    .background(PochakColors.Card, PochakShapes.Base)
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = "%02d월".format(month),
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                    color = PochakColors.TextPrimary,
                )
                Icon(
                    imageVector = Icons.Default.ArrowDropDown,
                    contentDescription = "Select month",
                    tint = PochakColors.TextSecondary,
                    modifier = Modifier.size(18.dp),
                )
            }
            DropdownMenu(
                expanded = monthExpanded,
                onDismissRequest = { monthExpanded = false },
                modifier = Modifier.background(PochakColors.Card),
            ) {
                (1..12).forEach { m ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                "%02d월".format(m),
                                color = if (m == month) PochakColors.Primary else PochakColors.TextPrimary,
                                style = PochakTypographyTokens.Body02,
                            )
                        },
                        onClick = {
                            onMonthChange(m)
                            monthExpanded = false
                        },
                    )
                }
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// 이달의대회 Tab Content
// ────────────────────────────────────────────────────────

@Composable
private fun CompetitionsTab(
    competitions: List<CompetitionInfo>,
    onCompetitionClick: (Long) -> Unit,
) {
    LazyColumn(
        contentPadding = PaddingValues(bottom = 80.dp),
    ) {
        items(
            items = competitions,
            key = { it.id },
        ) { competition ->
            CompetitionCard(
                competition = competition,
                onClick = { onCompetitionClick(competition.id) },
            )
        }
    }
}

@Composable
private fun CompetitionCard(
    competition: CompetitionInfo,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 8.dp),
    ) {
        // Banner image
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp)
                .clip(PochakShapes.Medium)
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            Color(0xFF1A237E), // dark blue
                            Color(0xFF283593),
                        ),
                    )
                ),
        ) {
            // Gradient overlay at bottom
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.4f)),
                            startY = 60f,
                        )
                    ),
            )

            // Placeholder
            Text(
                text = "P",
                modifier = Modifier.align(Alignment.Center),
                color = Color.White.copy(alpha = 0.2f),
                style = PochakTypographyTokens.LogoLarge,
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Competition info
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = competition.name,
                    style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = competition.dateRange,
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextSecondary,
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    competition.tags.forEach { tag ->
                        Text(
                            text = tag,
                            style = PochakTypographyTokens.Overline,
                            color = PochakColors.TextTertiary,
                            modifier = Modifier
                                .background(PochakColors.Surface, PochakShapes.Small)
                                .padding(horizontal = 8.dp, vertical = 3.dp),
                        )
                    }
                }
            }
            Icon(
                imageVector = Icons.Default.MoreVert,
                contentDescription = "More options",
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(20.dp),
            )
        }

        Spacer(modifier = Modifier.height(8.dp))
        HorizontalDivider(thickness = 1.dp, color = PochakColors.Border)
    }
}

// ────────────────────────────────────────────────────────
// Sport Tab Content (Match List)
// ────────────────────────────────────────────────────────

@Composable
private fun MatchListTab(
    competitions: List<CompetitionInfo>,
    matches: List<MatchInfo>,
    onContentClick: (Long) -> Unit,
) {
    LazyColumn(
        contentPadding = PaddingValues(bottom = 80.dp),
    ) {
        // Competition carousel at top
        if (competitions.isNotEmpty()) {
            item(key = "comp_carousel") {
                CompetitionCarousel(competitions)
            }
        }

        // Group matches by date
        val groupedMatches = matches.groupBy { it.date }

        groupedMatches.forEach { (date, dateMatches) ->
            // Date header
            item(key = "date_header_$date") {
                DateHeader(date = date)
            }

            // Match cards
            itemsIndexed(
                items = dateMatches,
                key = { _, match -> "match_${match.id}" },
            ) { index, match ->
                MatchCard(
                    match = match,
                    onClick = { onContentClick(match.id) },
                )
            }
        }
    }
}

@Composable
private fun CompetitionCarousel(competitions: List<CompetitionInfo>) {
    val pagerState = rememberPagerState(pageCount = { competitions.size })

    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp),
            contentPadding = PaddingValues(horizontal = 16.dp),
            pageSpacing = 12.dp,
        ) { page ->
            val comp = competitions[page]
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(PochakShapes.Medium)
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                Color(0xFF1A237E),
                                Color(0xFF283593),
                            ),
                        )
                    ),
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("P", color = Color.White, style = PochakTypographyTokens.Body02)
                    }
                    Column {
                        Text(
                            text = comp.name,
                            style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
                            color = Color.White,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = comp.dateRange,
                            style = PochakTypographyTokens.Body04,
                            color = Color.White.copy(alpha = 0.7f),
                        )
                    }
                }
            }
        }

        // Dots indicator
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
        ) {
            repeat(competitions.size) { index ->
                val isSelected = pagerState.currentPage == index
                Box(
                    modifier = Modifier
                        .padding(horizontal = 2.dp)
                        .size(if (isSelected) 6.dp else 4.dp)
                        .clip(CircleShape)
                        .background(
                            if (isSelected) PochakColors.Primary else PochakColors.TextTertiary,
                        ),
                )
            }
        }
    }
}

@Composable
private fun DateHeader(date: String) {
    val dayOfWeek = when {
        date.endsWith("01") -> "(토)"
        date.endsWith("02") -> "(일)"
        date.endsWith("03") -> "(월)"
        else -> "(화)"
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = "$date $dayOfWeek",
            style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.SemiBold),
            color = PochakColors.TextSecondary,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun MatchCard(
    match: MatchInfo,
    onClick: () -> Unit,
) {
    val borderColor = when (match.status) {
        MatchStatus.LIVE -> PochakColors.LiveRed
        else -> PochakColors.Border
    }
    val borderWidth = when (match.status) {
        MatchStatus.LIVE -> 2.dp
        else -> 1.dp
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .border(borderWidth, borderColor, PochakShapes.Medium)
            .clip(PochakShapes.Medium)
            .background(PochakColors.Card)
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Teams column (left side)
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            // Home team row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(PochakColors.SurfaceVariant),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        match.homeTeam.take(1),
                        style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.Bold),
                        color = PochakColors.TextSecondary,
                    )
                }
                Text(
                    text = match.homeTeam,
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                    color = PochakColors.TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
            }

            // Away team row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(PochakColors.SurfaceVariant),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        match.awayTeam.take(1),
                        style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.Bold),
                        color = PochakColors.TextSecondary,
                    )
                }
                Text(
                    text = match.awayTeam,
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                    color = PochakColors.TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
            }

            // Time + status row
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (match.status == MatchStatus.LIVE) {
                    PochakBadge(type = ContentType.LIVE)
                    Spacer(modifier = Modifier.width(4.dp))
                }
                Text(
                    text = buildString {
                        append(match.time)
                        if (match.round.isNotEmpty()) {
                            append(" | ")
                            append(match.round)
                        }
                    },
                    style = PochakTypographyTokens.Body04,
                    color = PochakColors.TextTertiary,
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Score column (center)
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.width(36.dp),
        ) {
            val homeScore = match.homeScore
            val awayScore = match.awayScore
            if (homeScore != null && awayScore != null) {
                Text(
                    text = "$homeScore",
                    style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                )
                Text(
                    text = "-",
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextTertiary,
                )
                Text(
                    text = "$awayScore",
                    style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                )
            } else {
                Text(
                    text = "-",
                    style = PochakTypographyTokens.Title03,
                    color = PochakColors.TextTertiary,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "-",
                    style = PochakTypographyTokens.Title03,
                    color = PochakColors.TextTertiary,
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Thumbnail (right side)
        Box(
            modifier = Modifier
                .size(width = 80.dp, height = 56.dp)
                .clip(PochakShapes.Base)
                .background(PochakColors.SurfaceVariant),
            contentAlignment = Alignment.Center,
        ) {
            when (match.status) {
                MatchStatus.COMPLETED -> {
                    if (match.hasVideo) {
                        Icon(
                            imageVector = Icons.Default.PlayCircleFilled,
                            contentDescription = "Play video",
                            tint = Color.White.copy(alpha = 0.8f),
                            modifier = Modifier.size(28.dp),
                        )
                    } else {
                        Text(
                            "P",
                            style = PochakTypographyTokens.Body03,
                            color = PochakColors.TextTertiary,
                        )
                    }
                }
                MatchStatus.LIVE -> {
                    // Live indicator
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayCircleFilled,
                            contentDescription = "Watch live",
                            tint = PochakColors.LiveRed,
                            modifier = Modifier.size(28.dp),
                        )
                    }
                }
                MatchStatus.UPCOMING -> {
                    // Lock icon for upcoming
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Upcoming - not available yet",
                        tint = PochakColors.TextTertiary,
                        modifier = Modifier.size(24.dp),
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
private fun PreviewScheduleScreen() {
    PochakTheme {
        ScheduleScreen()
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewScheduleScreenMatchTab() {
    PochakTheme {
        ScheduleScreen()
    }
}
