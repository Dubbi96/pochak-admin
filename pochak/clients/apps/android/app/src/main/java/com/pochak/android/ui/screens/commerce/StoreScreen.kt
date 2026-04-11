package com.pochak.android.ui.screens.commerce

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
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.*
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// Store Data Models
// ────────────────────────────────────────────────────────

private data class StoreProduct(
    val id: Long,
    val name: String,
    val description: String,
    val monthlyPrice: String,
    val annualPrice: String? = null,
    val discount: String? = null,
    val category: ProductCategory,
    val sportType: String? = null,
    val competitionName: String? = null,
)

private enum class ProductCategory { SUBSCRIPTION, SPORT_TICKET, COMPETITION_TICKET, PARTNERSHIP }

private val sampleProducts = listOf(
    StoreProduct(
        1, "베이직 구독",
        "1인 시청권\n모든 종목 VOD 시청\n클립 생성 무제한",
        "월 5,500원", "연 55,000원 -17%", "-17%",
        ProductCategory.SUBSCRIPTION,
    ),
    StoreProduct(
        2, "패밀리 구독",
        "4인 가족 시청권\n모든 종목 VOD 시청\n클립 생성 무제한",
        "월 10,010원", "연 101,010원 -17%", "-17%",
        ProductCategory.SUBSCRIPTION,
    ),
    StoreProduct(
        3, "대가족 무제한 시청권",
        "6인 가족 시청권\n모든 종목 + LIVE\n클립 생성 무제한",
        "월 15,000원", "연 150,000원 -17%", "-17%",
        ProductCategory.SUBSCRIPTION,
    ),
    StoreProduct(
        4, "축구 시즌권",
        "전체 축구 대회\nVOD + LIVE 시청\n하이라이트 클립 생성",
        "월 3,300원", null, null,
        ProductCategory.SPORT_TICKET, sportType = "축구",
    ),
    StoreProduct(
        5, "야구 시즌권",
        "전체 야구 대회\nVOD + LIVE 시청\n하이라이트 클립 생성",
        "월 3,300원", null, null,
        ProductCategory.SPORT_TICKET, sportType = "야구",
    ),
    StoreProduct(
        6, "배구 시즌권",
        "전체 배구 대회\nVOD + LIVE 시청\n하이라이트 클립 생성",
        "월 3,300원", null, null,
        ProductCategory.SPORT_TICKET, sportType = "배구",
    ),
    StoreProduct(
        7, "핸드볼 시즌권",
        "전체 핸드볼 대회\nVOD + LIVE 시청\n하이라이트 클립 생성",
        "월 3,300원", null, null,
        ProductCategory.SPORT_TICKET, sportType = "핸드볼",
    ),
    StoreProduct(
        8, "농구 시즌권",
        "전체 농구 대회\nVOD + LIVE 시청\n하이라이트 클립 생성",
        "월 3,300원", null, null,
        ProductCategory.SPORT_TICKET, sportType = "농구",
    ),
    StoreProduct(
        9, "6회 MLB컵 리틀야구 U10",
        "2026.01.01 ~ 02.01\n야구 | 유소년부\nVOD + LIVE 시청",
        "3,300원", null, null,
        ProductCategory.COMPETITION_TICKET, competitionName = "6회 MLB컵 리틀야구 U10",
    ),
    StoreProduct(
        10, "2026 춘계 전국축구대회",
        "2026.02.15 ~ 03.15\n축구 | U14\nVOD + LIVE 시청",
        "3,300원", null, null,
        ProductCategory.COMPETITION_TICKET, competitionName = "2026 춘계 전국축구대회",
    ),
    StoreProduct(
        11, "106회 전국체육대회 (배구)",
        "2026.03.01 ~ 03.20\n배구 | 일반부\nVOD + LIVE 시청",
        "3,300원", null, null,
        ProductCategory.COMPETITION_TICKET, competitionName = "106회 전국체육대회 (배구)",
    ),
)

private val sportFilters = listOf("전체", "축구", "야구", "배구", "핸드볼", "농구")

// ────────────────────────────────────────────────────────
// StoreScreen
// ────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StoreScreen(
    onBackClick: () -> Unit = {},
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("전체", "제휴", "구독", "종목", "대회")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Store screen" },
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
                text = "스토어",
                style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextPrimary,
            )
        }

        // ── Tab Bar ──
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
                            style = PochakTypographyTokens.Body02.copy(
                                fontWeight = if (selectedTab == index) FontWeight.SemiBold
                                else FontWeight.Normal,
                            ),
                            color = if (selectedTab == index) PochakColors.TextPrimary
                            else PochakColors.TextSecondary,
                        )
                    },
                )
            }
        }

        // ── Tab Content ──
        when (selectedTab) {
            0 -> AllProductsTab()
            1 -> PartnershipTab()
            2 -> SubscriptionTab()
            3 -> SportTicketTab()
            4 -> CompetitionTicketTab()
        }
    }
}

// ════════════════════════════════════════════════════════
// Tab 0: 전체
// ════════════════════════════════════════════════════════

@Composable
private fun AllProductsTab() {
    val subscriptions = sampleProducts.filter { it.category == ProductCategory.SUBSCRIPTION }
    val sportTickets = sampleProducts.filter { it.category == ProductCategory.SPORT_TICKET }
    val compTickets = sampleProducts.filter { it.category == ProductCategory.COMPETITION_TICKET }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 32.dp),
    ) {
        // ── Subscriptions Section ──
        item(key = "sub_header") {
            SectionHeader(title = "구독상품", onMoreClick = { })
        }
        item(key = "sub_row") {
            ProductHorizontalRow(products = subscriptions)
        }

        item(key = "divider_1") {
            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(color = PochakColors.Border)
            Spacer(modifier = Modifier.height(8.dp))
        }

        // ── Sport Tickets Section ──
        item(key = "sport_header") {
            SectionHeader(title = "종목별 이용권", onMoreClick = { })
        }
        item(key = "sport_row") {
            ProductHorizontalRow(products = sportTickets)
        }

        item(key = "divider_2") {
            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(color = PochakColors.Border)
            Spacer(modifier = Modifier.height(8.dp))
        }

        // ── Competition Tickets Section ──
        item(key = "comp_header") {
            SectionHeader(title = "대회 이용권", onMoreClick = { })
        }
        item(key = "comp_row") {
            ProductHorizontalRow(products = compTickets)
        }
    }
}

// ════════════════════════════════════════════════════════
// Tab 1: 제휴
// ════════════════════════════════════════════════════════

@Composable
private fun PartnershipTab() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                Icons.Outlined.Handshake,
                contentDescription = null,
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(48.dp),
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "제휴 상품 준비중",
                style = PochakTypographyTokens.Body01,
                color = PochakColors.TextTertiary,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "다양한 제휴 상품이 곧 출시됩니다",
                style = PochakTypographyTokens.Body03,
                color = PochakColors.TextTertiary,
            )
        }
    }
}

// ════════════════════════════════════════════════════════
// Tab 2: 구독
// ════════════════════════════════════════════════════════

@Composable
private fun SubscriptionTab() {
    val subscriptions = sampleProducts.filter { it.category == ProductCategory.SUBSCRIPTION }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(subscriptions, key = { "sub_${it.id}" }) { product ->
            ProductCardFull(product = product)
        }
    }
}

// ════════════════════════════════════════════════════════
// Tab 3: 종목
// ════════════════════════════════════════════════════════

@Composable
private fun SportTicketTab() {
    var selectedFilter by remember { mutableIntStateOf(0) }
    val allSportProducts = sampleProducts.filter { it.category == ProductCategory.SPORT_TICKET }
    val filteredProducts = if (selectedFilter == 0) {
        allSportProducts
    } else {
        allSportProducts.filter { it.sportType == sportFilters[selectedFilter] }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Filter chips
        SportFilterChips(
            filters = sportFilters,
            selectedIndex = selectedFilter,
            onSelect = { selectedFilter = it },
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(filteredProducts, key = { "sport_${it.id}" }) { product ->
                ProductCardFull(product = product)
            }

            if (filteredProducts.isEmpty()) {
                item(key = "sport_empty") {
                    EmptyProductState(message = "해당 종목의 이용권이 없습니다")
                }
            }
        }
    }
}

// ════════════════════════════════════════════════════════
// Tab 4: 대회
// ════════════════════════════════════════════════════════

@Composable
private fun CompetitionTicketTab() {
    var selectedFilter by remember { mutableIntStateOf(0) }
    val allCompProducts = sampleProducts.filter { it.category == ProductCategory.COMPETITION_TICKET }
    val filteredProducts = if (selectedFilter == 0) {
        allCompProducts
    } else {
        val sportName = sportFilters[selectedFilter]
        allCompProducts.filter { it.description.contains(sportName) }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        SportFilterChips(
            filters = sportFilters,
            selectedIndex = selectedFilter,
            onSelect = { selectedFilter = it },
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(filteredProducts, key = { "comp_${it.id}" }) { product ->
                CompetitionProductCard(product = product)
            }

            if (filteredProducts.isEmpty()) {
                item(key = "comp_empty") {
                    EmptyProductState(message = "해당 종목의 대회 이용권이 없습니다")
                }
            }
        }
    }
}

// ════════════════════════════════════════════════════════
// Shared Components
// ════════════════════════════════════════════════════════

@Composable
private fun ProductHorizontalRow(products: List<StoreProduct>) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(products, key = { "h_${it.id}" }) { product ->
            ProductCardCompact(product = product)
        }
    }
}

@Composable
private fun ProductCardCompact(product: StoreProduct) {
    Column(
        modifier = Modifier
            .width(200.dp)
            .clip(PochakShapes.Medium)
            .border(1.dp, PochakColors.Border, PochakShapes.Medium)
            .background(PochakColors.Card)
            .clickable { }
            .padding(16.dp),
    ) {
        // Icon placeholder
        Box(
            modifier = Modifier
                .size(40.dp)
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
                style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextOnPrimary,
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = product.name,
            style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Bold),
            color = PochakColors.TextPrimary,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = product.description,
            style = PochakTypographyTokens.Body04,
            color = PochakColors.TextSecondary,
            maxLines = 3,
            overflow = TextOverflow.Ellipsis,
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Price
        Text(
            text = product.monthlyPrice,
            style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
            color = PochakColors.TextPrimary,
        )

        if (product.annualPrice != null) {
            Spacer(modifier = Modifier.height(2.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = product.annualPrice,
                    style = PochakTypographyTokens.Body04.copy(
                        textDecoration = TextDecoration.LineThrough,
                    ),
                    color = PochakColors.TextTertiary,
                )
                if (product.discount != null) {
                    Text(
                        text = product.discount,
                        style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.Bold),
                        color = PochakColors.Error,
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Purchase/Gift button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(PochakShapes.Button)
                .border(1.dp, PochakColors.Primary, PochakShapes.Button)
                .clickable { }
                .padding(vertical = 10.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "구매/선물",
                style = PochakTypographyTokens.ButtonMedium,
                color = PochakColors.Primary,
            )
        }
    }
}

@Composable
private fun ProductCardFull(product: StoreProduct) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(PochakShapes.Medium)
            .border(1.dp, PochakColors.Border, PochakShapes.Medium)
            .background(PochakColors.Card)
            .clickable { }
            .padding(16.dp),
    ) {
        Row(
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            // Icon placeholder
            Box(
                modifier = Modifier
                    .size(48.dp)
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
                    style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextOnPrimary,
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.name,
                    style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = product.description,
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextSecondary,
                    maxLines = 3,
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Price row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Bottom,
        ) {
            Column {
                Text(
                    text = product.monthlyPrice,
                    style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                )

                if (product.annualPrice != null) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        Text(
                            text = product.annualPrice,
                            style = PochakTypographyTokens.Body04.copy(
                                textDecoration = TextDecoration.LineThrough,
                            ),
                            color = PochakColors.TextTertiary,
                        )
                        if (product.discount != null) {
                            Text(
                                text = product.discount,
                                style = PochakTypographyTokens.Body04.copy(fontWeight = FontWeight.Bold),
                                color = PochakColors.Error,
                            )
                        }
                    }
                }
            }

            // Purchase/Gift button
            Box(
                modifier = Modifier
                    .clip(PochakShapes.Button)
                    .border(1.dp, PochakColors.Primary, PochakShapes.Button)
                    .clickable { }
                    .padding(horizontal = 20.dp, vertical = 10.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "구매/선물",
                    style = PochakTypographyTokens.ButtonMedium,
                    color = PochakColors.Primary,
                )
            }
        }
    }
}

@Composable
private fun CompetitionProductCard(product: StoreProduct) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(PochakShapes.Medium)
            .border(1.dp, PochakColors.Border, PochakShapes.Medium)
            .background(PochakColors.Card)
            .clickable { },
    ) {
        // Competition banner thumbnail
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .background(PochakColors.SurfaceVariant),
            contentAlignment = Alignment.Center,
        ) {
            // Gradient overlay
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.5f)
                    .align(Alignment.BottomCenter)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, PochakColors.Overlay),
                        )
                    ),
            )
            Text(
                text = "P",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextTertiary,
            )
        }

        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = product.name,
                style = PochakTypographyTokens.Body01.copy(fontWeight = FontWeight.Bold),
                color = PochakColors.TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = product.description,
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
                maxLines = 3,
            )

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = product.monthlyPrice,
                    style = PochakTypographyTokens.Title04.copy(fontWeight = FontWeight.Bold),
                    color = PochakColors.TextPrimary,
                )

                Box(
                    modifier = Modifier
                        .clip(PochakShapes.Button)
                        .border(1.dp, PochakColors.Primary, PochakShapes.Button)
                        .clickable { }
                        .padding(horizontal = 20.dp, vertical = 10.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "구매/선물",
                        style = PochakTypographyTokens.ButtonMedium,
                        color = PochakColors.Primary,
                    )
                }
            }
        }
    }
}

@Composable
private fun SportFilterChips(
    filters: List<String>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        filters.forEachIndexed { index, label ->
            val isSelected = selectedIndex == index
            FilterChip(
                selected = isSelected,
                onClick = { onSelect(index) },
                label = {
                    Text(
                        text = label,
                        style = PochakTypographyTokens.Body03.copy(
                            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                        ),
                    )
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = PochakColors.Primary,
                    selectedLabelColor = PochakColors.TextOnPrimary,
                    containerColor = Color.Transparent,
                    labelColor = PochakColors.TextSecondary,
                ),
                border = FilterChipDefaults.filterChipBorder(
                    borderColor = PochakColors.BorderLight,
                    selectedBorderColor = Color.Transparent,
                    enabled = true,
                    selected = isSelected,
                ),
            )
        }
    }
}

@Composable
private fun EmptyProductState(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                Icons.Outlined.Inventory2,
                contentDescription = null,
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(40.dp),
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = message,
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextTertiary,
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewStoreScreen() {
    PochakTheme {
        StoreScreen()
    }
}
