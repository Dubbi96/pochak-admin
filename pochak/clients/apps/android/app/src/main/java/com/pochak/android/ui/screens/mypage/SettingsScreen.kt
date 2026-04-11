package com.pochak.android.ui.screens.mypage

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.data.model.SampleData
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// SettingsScreen
// ────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBackClick: () -> Unit = {},
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("알림설정", "즐겨찾는 항목 알림", "서비스기본설정", "환경설정")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Settings screen" },
    ) {
        // ── Top Bar ──
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 4.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = PochakColors.TextPrimary,
                )
            }
            Text(
                text = "설정",
                style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextPrimary,
            )
        }

        // ── Tab Bar (scrollable) ──
        ScrollableTabRow(
            selectedTabIndex = selectedTab,
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
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = title,
                            style = PochakTypographyTokens.Body03.copy(
                                fontWeight = if (selectedTab == index) FontWeight.SemiBold
                                else FontWeight.Normal,
                            ),
                            color = if (selectedTab == index) PochakColors.TextPrimary
                            else PochakColors.TextSecondary,
                            maxLines = 1,
                        )
                    },
                )
            }
        }

        // ── Tab Content ──
        when (selectedTab) {
            0 -> NotificationSettingsTab()
            1 -> FavoriteAlertsTab()
            2 -> ServiceDefaultsTab()
            3 -> EnvironmentSettingsTab()
        }
    }
}

// ════════════════════════════════════════════════════════
// Tab 0: 알림설정
// ════════════════════════════════════════════════════════

@Composable
private fun NotificationSettingsTab() {
    var selectedPill by remember { mutableIntStateOf(0) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 32.dp),
    ) {
        // Toggle pills
        item(key = "notif_pills") {
            NotificationPills(
                selected = selectedPill,
                onSelect = { selectedPill = it },
                labels = listOf("서비스 알림", "마케팅, 광고 알림"),
            )
        }

        when (selectedPill) {
            0 -> {
                // ── Service Notifications ──
                item(key = "svc_time_header") {
                    SettingsSectionHeader(title = "알림 시간대")
                }
                item(key = "svc_night") {
                    SettingsToggleRow(
                        label = "야간 서비스 알림 (21시 ~ 08시)",
                        initialChecked = false,
                    )
                }

                item(key = "svc_tv_header") {
                    SettingsSectionHeader(title = "포착TV")
                }
                item(key = "svc_tv_1") {
                    SettingsToggleRow(label = "시청예약 경기 미리알림 (10분전)", initialChecked = true)
                }
                item(key = "svc_tv_2") {
                    SettingsToggleRow(label = "클립 생성 완료", initialChecked = true)
                }
                item(key = "svc_tv_3") {
                    SettingsToggleRow(label = "내 클립 '좋아요'", initialChecked = true)
                }
                item(key = "svc_tv_4") {
                    SettingsToggleRow(label = "추천 대회 소식", initialChecked = true)
                }
                item(key = "svc_tv_5") {
                    SettingsToggleRow(label = "이용 상품 소식", initialChecked = true)
                }
                item(key = "svc_tv_6") {
                    SettingsToggleRow(label = "새 선물 도착", initialChecked = true)
                }

                item(key = "svc_city_header") {
                    SettingsSectionHeader(title = "포착 City")
                }
                item(key = "svc_city_1") {
                    SettingsToggleRow(label = "관심, 추천 시설 소식", initialChecked = true)
                }

                item(key = "svc_club_header") {
                    SettingsSectionHeader(title = "포착Club")
                }
                item(key = "svc_club_1") {
                    SettingsToggleRow(label = "가입 클럽 소식", initialChecked = true)
                }
                item(key = "svc_club_2") {
                    SettingsToggleRow(label = "추천 클럽 소식", initialChecked = true)
                }

                item(key = "svc_svc_header") {
                    SettingsSectionHeader(title = "서비스 알림")
                }
                item(key = "svc_svc_1") {
                    SettingsToggleRow(label = "서비스 운영", initialChecked = true)
                }
                item(key = "svc_svc_2") {
                    SettingsToggleRow(label = "공지사항", initialChecked = true)
                }
                item(key = "svc_svc_3") {
                    SettingsToggleRow(label = "이벤트", initialChecked = true)
                }
            }

            1 -> {
                // ── Marketing Notifications ──
                item(key = "mkt_header") {
                    SettingsSectionHeader(title = "마케팅 정보 수신")
                }
                item(key = "mkt_terms") {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { }
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                    ) {
                        Text(
                            text = "약관 동의하기",
                            style = PochakTypographyTokens.Body03,
                            color = PochakColors.Primary,
                        )
                    }
                }
                item(key = "mkt_sms") {
                    SettingsToggleRow(label = "SMS 수신", initialChecked = false)
                }
                item(key = "mkt_email") {
                    SettingsToggleRow(label = "이메일 수신", initialChecked = false)
                }
                item(key = "mkt_push") {
                    SettingsToggleRow(label = "앱 푸시 수신", initialChecked = false)
                }

                item(key = "mkt_privacy_header") {
                    SettingsSectionHeader(title = "개인정보 수집 이용")
                }
                item(key = "mkt_ad") {
                    SettingsToggleRow(label = "맞춤형 광고 설정", initialChecked = true)
                }
            }
        }
    }
}

// ════════════════════════════════════════════════════════
// Tab 1: 즐겨찾는 항목 알림
// ════════════════════════════════════════════════════════

@Composable
private fun FavoriteAlertsTab() {
    var selectedPill by remember { mutableIntStateOf(0) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 32.dp),
    ) {
        item(key = "fav_pills") {
            NotificationPills(
                selected = selectedPill,
                onSelect = { selectedPill = it },
                labels = listOf("팀/클럽", "대회"),
            )
        }

        when (selectedPill) {
            0 -> {
                // ── Teams/Clubs ──
                val teams = SampleData.teamClubs
                items(teams, key = { "fav_team_${it.id}" }) { team ->
                    FavoriteTeamRow(
                        name = team.name,
                        meta = "${team.sportType} | ${team.division}",
                    )
                }
            }

            1 -> {
                // ── Competitions ──
                val competitions = SampleData.competitions
                items(competitions, key = { "fav_comp_${it.id}" }) { comp ->
                    FavoriteCompetitionRow(
                        name = comp.name,
                        dateRange = comp.dateRange,
                        tags = comp.tags,
                    )
                }
            }
        }
    }
}

@Composable
private fun FavoriteTeamRow(
    name: String,
    meta: String,
) {
    var notificationEnabled by remember { mutableStateOf(true) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Bookmark icon
        Icon(
            Icons.Filled.Bookmark,
            contentDescription = "Bookmarked",
            tint = PochakColors.Primary,
            modifier = Modifier.size(22.dp),
        )

        // Team logo placeholder
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(PochakColors.SurfaceVariant),
            contentAlignment = Alignment.Center,
        ) {
            Text("T", color = PochakColors.TextTertiary, style = PochakTypographyTokens.Body02)
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = name,
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = meta,
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
            )
        }

        // Notification toggle
        Switch(
            checked = notificationEnabled,
            onCheckedChange = { notificationEnabled = it },
            colors = SwitchDefaults.colors(
                checkedThumbColor = PochakColors.TextOnPrimary,
                checkedTrackColor = PochakColors.Primary,
                uncheckedThumbColor = PochakColors.TextSecondary,
                uncheckedTrackColor = PochakColors.SurfaceVariant,
                uncheckedBorderColor = PochakColors.BorderLight,
            ),
            modifier = Modifier.height(24.dp),
        )
    }
}

@Composable
private fun FavoriteCompetitionRow(
    name: String,
    dateRange: String,
    tags: List<String>,
) {
    var notificationEnabled by remember { mutableStateOf(true) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Bookmark icon
        Icon(
            Icons.Filled.Bookmark,
            contentDescription = "Bookmarked",
            tint = PochakColors.Primary,
            modifier = Modifier.size(22.dp),
        )

        // Competition thumbnail placeholder
        Box(
            modifier = Modifier
                .size(56.dp, 40.dp)
                .clip(PochakShapes.Small)
                .background(PochakColors.SurfaceVariant),
            contentAlignment = Alignment.Center,
        ) {
            Text("P", color = PochakColors.TextTertiary, style = PochakTypographyTokens.Body03)
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = name,
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = dateRange,
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                tags.forEach { tag ->
                    Text(
                        text = tag,
                        style = PochakTypographyTokens.Body04,
                        color = PochakColors.TextTertiary,
                    )
                }
            }
        }

        Switch(
            checked = notificationEnabled,
            onCheckedChange = { notificationEnabled = it },
            colors = SwitchDefaults.colors(
                checkedThumbColor = PochakColors.TextOnPrimary,
                checkedTrackColor = PochakColors.Primary,
                uncheckedThumbColor = PochakColors.TextSecondary,
                uncheckedTrackColor = PochakColors.SurfaceVariant,
                uncheckedBorderColor = PochakColors.BorderLight,
            ),
            modifier = Modifier.height(24.dp),
        )
    }
}

// ════════════════════════════════════════════════════════
// Tab 2: 서비스기본설정
// ════════════════════════════════════════════════════════

@Composable
private fun ServiceDefaultsTab() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 32.dp),
    ) {
        item(key = "svc_content_header") {
            SettingsSectionHeader(title = "콘텐츠 시청")
        }
        item(key = "svc_mute") {
            SettingsToggleRow(label = "음소거", initialChecked = false)
        }
        item(key = "svc_preview") {
            SettingsToggleRow(label = "미리보기", initialChecked = true)
        }
        item(key = "svc_autoplay") {
            SettingsToggleRow(label = "자동재생", initialChecked = true)
        }
        item(key = "svc_pip") {
            SettingsToggleRow(label = "PIP모드 활성", initialChecked = true)
        }
        item(key = "svc_autostop") {
            SettingsToggleRow(label = "자동재생 중단", initialChecked = false)
        }
        item(key = "svc_wifi") {
            SettingsToggleRow(label = "Wi-Fi 환경에서만 재생", initialChecked = false)
        }

        item(key = "svc_clip_header") {
            SettingsSectionHeader(title = "클립 공개 범위")
        }
        item(key = "svc_clip_public") {
            SettingsToggleRow(label = "전체공개", initialChecked = true)
        }

        item(key = "svc_product_header") {
            SettingsSectionHeader(title = "알림")
        }
        item(key = "svc_product_news") {
            SettingsToggleRow(label = "이용 상품 소식", initialChecked = true)
        }
        item(key = "svc_gift_arrived") {
            SettingsToggleRow(label = "새 선물 도착", initialChecked = true)
        }
    }
}

// ════════════════════════════════════════════════════════
// Tab 3: 환경설정
// ════════════════════════════════════════════════════════

@Composable
private fun EnvironmentSettingsTab() {
    var selectedCountry by remember { mutableStateOf("대한민국") }
    var selectedDesign by remember { mutableStateOf("다크모드") }
    var countryExpanded by remember { mutableStateOf(false) }
    var designExpanded by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 32.dp),
    ) {
        item(key = "env_country") {
            SettingsDropdownRow(
                label = "이용국가",
                value = selectedCountry,
                expanded = countryExpanded,
                onExpandChange = { countryExpanded = it },
                options = listOf("대한민국", "United States", "Japan"),
                onSelect = {
                    selectedCountry = it
                    countryExpanded = false
                },
            )
        }

        item(key = "env_divider_1") {
            HorizontalDivider(
                modifier = Modifier.padding(horizontal = 16.dp),
                color = PochakColors.Border,
            )
        }

        item(key = "env_design") {
            SettingsDropdownRow(
                label = "디자인",
                value = selectedDesign,
                expanded = designExpanded,
                onExpandChange = { designExpanded = it },
                options = listOf("다크모드", "라이트모드", "시스템 설정"),
                onSelect = {
                    selectedDesign = it
                    designExpanded = false
                },
            )
        }

        item(key = "env_divider_2") {
            HorizontalDivider(
                modifier = Modifier.padding(horizontal = 16.dp),
                color = PochakColors.Border,
            )
        }

        item(key = "env_version") {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "앱버전",
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    text = "v3.0",
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.TextSecondary,
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "업데이트하기",
                    style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.Medium),
                    color = PochakColors.Primary,
                    modifier = Modifier.clickable { },
                )
                Icon(
                    Icons.Default.OpenInNew,
                    contentDescription = "Open update",
                    tint = PochakColors.Primary,
                    modifier = Modifier
                        .size(16.dp)
                        .padding(start = 2.dp),
                )
            }
        }

        item(key = "env_divider_3") {
            HorizontalDivider(
                modifier = Modifier.padding(horizontal = 16.dp),
                color = PochakColors.Border,
            )
        }

        // Terms and policies links
        item(key = "env_terms") {
            SettingsLinkRow(label = "서비스 이용약관")
        }
        item(key = "env_privacy") {
            SettingsLinkRow(label = "개인정보 처리방침")
        }
        item(key = "env_opensource") {
            SettingsLinkRow(label = "오픈소스 라이선스")
        }
    }
}

// ════════════════════════════════════════════════════════
// Shared Components
// ════════════════════════════════════════════════════════

@Composable
private fun NotificationPills(
    selected: Int,
    onSelect: (Int) -> Unit,
    labels: List<String>,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        labels.forEachIndexed { index, label ->
            val isSelected = selected == index
            Box(
                modifier = Modifier
                    .clip(PochakShapes.Full)
                    .background(
                        if (isSelected) PochakColors.Primary else Color.Transparent
                    )
                    .border(
                        width = 1.dp,
                        color = if (isSelected) PochakColors.Primary else PochakColors.BorderLight,
                        shape = PochakShapes.Full,
                    )
                    .clickable { onSelect(index) }
                    .padding(horizontal = 16.dp, vertical = 8.dp),
            ) {
                Text(
                    text = label,
                    style = PochakTypographyTokens.Body03.copy(
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    ),
                    color = if (isSelected) PochakColors.TextOnPrimary else PochakColors.TextSecondary,
                )
            }
        }
    }
}

@Composable
private fun SettingsSectionHeader(title: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(PochakColors.SurfaceVariant)
            .padding(horizontal = 16.dp, vertical = 10.dp),
    ) {
        Text(
            text = title,
            style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.Medium),
            color = PochakColors.TextSecondary,
        )
    }
}

@Composable
private fun SettingsToggleRow(
    label: String,
    initialChecked: Boolean,
) {
    var checked by remember { mutableStateOf(initialChecked) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { checked = !checked }
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = PochakTypographyTokens.Body02,
            color = PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
        )
        Switch(
            checked = checked,
            onCheckedChange = { checked = it },
            colors = SwitchDefaults.colors(
                checkedThumbColor = PochakColors.TextOnPrimary,
                checkedTrackColor = PochakColors.Primary,
                uncheckedThumbColor = PochakColors.TextSecondary,
                uncheckedTrackColor = PochakColors.SurfaceVariant,
                uncheckedBorderColor = PochakColors.BorderLight,
            ),
            modifier = Modifier.height(24.dp),
        )
    }
}

@Composable
private fun SettingsDropdownRow(
    label: String,
    value: String,
    expanded: Boolean,
    onExpandChange: (Boolean) -> Unit,
    options: List<String>,
    onSelect: (String) -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onExpandChange(!expanded) },
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = label,
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            Text(
                text = value,
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextSecondary,
            )
            Icon(
                if (expanded) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
                contentDescription = "Expand $label",
                tint = PochakColors.TextSecondary,
                modifier = Modifier.size(24.dp),
            )
        }

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { onExpandChange(false) },
            modifier = Modifier
                .background(PochakColors.SurfaceVariant),
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = {
                        Text(
                            text = option,
                            style = PochakTypographyTokens.Body02,
                            color = if (option == value) PochakColors.Primary
                            else PochakColors.TextPrimary,
                        )
                    },
                    onClick = { onSelect(option) },
                )
            }
        }
    }
}

@Composable
private fun SettingsLinkRow(label: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = PochakTypographyTokens.Body02,
            color = PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
        )
        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = "Open $label",
            tint = PochakColors.TextTertiary,
            modifier = Modifier.size(20.dp),
        )
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewSettingsScreen() {
    PochakTheme {
        SettingsScreen()
    }
}
