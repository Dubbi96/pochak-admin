package com.pochak.android.ui.screens.mypage

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.data.model.SampleData
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// MyMenuHubScreen
// ────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyMenuHubScreen(
    onBackClick: () -> Unit = {},
    onNavigate: (String) -> Unit = {},
    onLogout: () -> Unit = {},
) {
    val profile = SampleData.userProfile

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "My menu hub screen" },
    ) {
        // ── Top Bar ──
        MenuHubTopBar(
            onBackClick = onBackClick,
            onNotificationClick = { onNavigate("notification") },
            onSettingsClick = { onNavigate("settings") },
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 32.dp),
        ) {
            // ── Profile Section ──
            item(key = "profile") {
                ProfileSection(
                    nickname = profile.nickname,
                    email = profile.email,
                    onClick = { onNavigate("profile_edit") },
                )
            }

            // ── Subscription Banner ──
            item(key = "subscription") {
                SubscriptionManageBanner(
                    onManageClick = { onNavigate("subscription") },
                )
            }

            // ── Wallet Grid ──
            item(key = "wallet") {
                WalletGridSection(
                    onPolClick = { onNavigate("pol_manage") },
                    onTicketClick = { onNavigate("ticket_manage") },
                    onGiftClick = { onNavigate("gift_box") },
                )
            }

            item(key = "divider_1") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 8.dp),
                    color = PochakColors.Border,
                )
            }

            // ── Menu Group: 포착 TV ──
            item(key = "group_tv") {
                MenuGroupHeader(title = "포착 TV")
            }
            item(key = "tv_items") {
                MenuGroupItems(
                    items = listOf(
                        MenuItemData("구독/이용권 구매", Icons.Outlined.ShoppingCart, "store"),
                        MenuItemData("시청내역", Icons.Outlined.History, "watch_history"),
                        MenuItemData("내 클립", Icons.Outlined.ContentCut, "my_clips"),
                        MenuItemData("시청예약", Icons.Outlined.CalendarMonth, "watch_reservation"),
                        MenuItemData("즐겨찾기", Icons.Outlined.BookmarkBorder, "favorites"),
                    ),
                    onNavigate = onNavigate,
                )
            }

            item(key = "divider_2") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 4.dp),
                    color = PochakColors.Border,
                )
            }

            // ── Menu Group: 포착 Club ──
            item(key = "group_club") {
                MenuGroupHeader(title = "포착 Club")
            }
            item(key = "club_items") {
                MenuGroupItems(
                    items = listOf(
                        MenuItemData("가입한 클럽", Icons.Outlined.Groups, "joined_clubs"),
                        MenuItemData("관심클럽", Icons.Outlined.FavoriteBorder, "interested_clubs"),
                        MenuItemData("커뮤니티", Icons.Outlined.Forum, "community"),
                    ),
                    onNavigate = onNavigate,
                )
            }

            item(key = "divider_3") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 4.dp),
                    color = PochakColors.Border,
                )
            }

            // ── Menu Group: 포착 City ──
            item(key = "group_city") {
                MenuGroupHeader(title = "포착 City")
            }
            item(key = "city_items") {
                MenuGroupItems(
                    items = listOf(
                        MenuItemData("대회소식", Icons.Outlined.Campaign, "competition_news"),
                        MenuItemData("시설예약", Icons.Outlined.LocationOn, "facility_reservation"),
                        MenuItemData("자주가는 시설", Icons.Outlined.Bookmark, "frequent_facilities"),
                    ),
                    onNavigate = onNavigate,
                )
            }

            item(key = "divider_4") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 4.dp),
                    color = PochakColors.Border,
                )
            }

            // ── Menu Group: 서비스 ──
            item(key = "group_service") {
                MenuGroupHeader(title = "서비스")
            }
            item(key = "service_items") {
                MenuGroupItems(
                    items = listOf(
                        MenuItemData("알림내역", Icons.Outlined.Notifications, "notification"),
                        MenuItemData("설정", Icons.Outlined.Settings, "settings"),
                        MenuItemData("공지사항", Icons.Outlined.Announcement, "notices"),
                        MenuItemData("고객센터", Icons.Outlined.ContactSupport, "support"),
                    ),
                    onNavigate = onNavigate,
                )
            }

            item(key = "divider_5") {
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 8.dp),
                    color = PochakColors.Border,
                )
            }

            // ── Logout ──
            item(key = "logout") {
                LogoutButton(onLogout = onLogout)
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Top Bar
// ────────────────────────────────────────────────────────

@Composable
private fun MenuHubTopBar(
    onBackClick: () -> Unit,
    onNotificationClick: () -> Unit,
    onSettingsClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 4.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBackClick) {
            Icon(
                Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = PochakColors.TextPrimary,
            )
        }

        Row {
            IconButton(onClick = onNotificationClick) {
                Icon(
                    Icons.Outlined.Notifications,
                    contentDescription = "Notifications",
                    tint = PochakColors.TextPrimary,
                )
            }
            IconButton(onClick = onSettingsClick) {
                Icon(
                    Icons.Outlined.Settings,
                    contentDescription = "Settings",
                    tint = PochakColors.TextPrimary,
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Profile Section
// ────────────────────────────────────────────────────────

@Composable
private fun ProfileSection(
    nickname: String,
    email: String,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Avatar
        Box(
            modifier = Modifier
                .size(56.dp)
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
            Text(
                text = nickname,
                style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextPrimary,
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = email,
                style = PochakTypographyTokens.Body03,
                color = PochakColors.TextSecondary,
            )
        }

        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = "Go to profile",
            tint = PochakColors.TextSecondary,
            modifier = Modifier.size(24.dp),
        )
    }
}

// ────────────────────────────────────────────────────────
// Subscription Management Banner
// ────────────────────────────────────────────────────────

@Composable
private fun SubscriptionManageBanner(
    onManageClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(PochakShapes.Large)
            .background(PochakColors.SurfaceVariant)
            .border(1.dp, PochakColors.Primary.copy(alpha = 0.3f), PochakShapes.Large)
            .clickable(onClick = onManageClick)
            .padding(16.dp),
    ) {
        Column {
            // Title row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = "구독 관리",
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                    color = PochakColors.Primary,
                )
                Icon(
                    Icons.AutoMirrored.Filled.KeyboardArrowRight,
                    contentDescription = null,
                    tint = PochakColors.Primary,
                    modifier = Modifier.size(18.dp),
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "다음결제일: 2026.01.01",
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Subscription plan name
            Box(
                modifier = Modifier
                    .clip(PochakShapes.Base)
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(PochakColors.PrimaryDark, PochakColors.Primary),
                        )
                    )
                    .padding(horizontal = 12.dp, vertical = 8.dp),
            ) {
                Text(
                    text = "대가족 무제한 시청권",
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextOnPrimary,
                )
            }
        }
    }
}

// ────────────────────────────────────────────────────────
// Wallet Grid Section
// ────────────────────────────────────────────────────────

@Composable
private fun WalletGridSection(
    onPolClick: () -> Unit,
    onTicketClick: () -> Unit,
    onGiftClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        WalletCard(
            title = "뽈/기프트뽈 관리",
            value = "10,000P / 1,000P",
            icon = Icons.Outlined.MonetizationOn,
            onClick = onPolClick,
            modifier = Modifier.weight(1f),
        )
        WalletCard(
            title = "이용권 관리",
            value = "10개",
            icon = Icons.Outlined.ConfirmationNumber,
            onClick = onTicketClick,
            modifier = Modifier.weight(1f),
        )
        WalletCard(
            title = "선물함",
            value = "10개",
            icon = Icons.Outlined.CardGiftcard,
            onClick = onGiftClick,
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun WalletCard(
    title: String,
    value: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(PochakShapes.Medium)
            .border(1.dp, PochakColors.Border, PochakShapes.Medium)
            .background(PochakColors.SurfaceVariant)
            .clickable(onClick = onClick)
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        // Title with chevron
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
        ) {
            Text(
                text = title,
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Icon(
                Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = PochakColors.TextSecondary,
                modifier = Modifier.size(14.dp),
            )
        }

        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = PochakColors.Primary,
            modifier = Modifier.size(24.dp),
        )

        Text(
            text = value,
            style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.Bold),
            color = PochakColors.TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

// ────────────────────────────────────────────────────────
// Menu Group Components
// ────────────────────────────────────────────────────────

private data class MenuItemData(
    val label: String,
    val icon: ImageVector,
    val route: String,
)

@Composable
private fun MenuGroupHeader(title: String) {
    Text(
        text = title,
        style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
        color = PochakColors.Primary,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
    )
}

@Composable
private fun MenuGroupItems(
    items: List<MenuItemData>,
    onNavigate: (String) -> Unit,
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        items.forEach { item ->
            MenuRow(
                icon = item.icon,
                label = item.label,
                onClick = { onNavigate(item.route) },
            )
        }
    }
}

@Composable
private fun MenuRow(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = PochakColors.TextSecondary,
            modifier = Modifier.size(22.dp),
        )
        Spacer(modifier = Modifier.width(14.dp))
        Text(
            text = label,
            style = PochakTypographyTokens.Body02,
            color = PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
        )
        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = PochakColors.TextTertiary,
            modifier = Modifier.size(20.dp),
        )
    }
}

// ────────────────────────────────────────────────────────
// Logout Button
// ────────────────────────────────────────────────────────

@Composable
private fun LogoutButton(onLogout: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 16.dp),
        contentAlignment = Alignment.Center,
    ) {
        Box(
            modifier = Modifier
                .clip(PochakShapes.Full)
                .background(PochakColors.SurfaceVariant)
                .border(1.dp, PochakColors.Border, PochakShapes.Full)
                .clickable(onClick = onLogout)
                .padding(horizontal = 40.dp, vertical = 12.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "로그아웃",
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Medium),
                color = PochakColors.TextSecondary,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewMyMenuHubScreen() {
    PochakTheme {
        MyMenuHubScreen()
    }
}
