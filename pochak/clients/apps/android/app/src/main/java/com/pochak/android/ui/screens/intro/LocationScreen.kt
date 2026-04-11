package com.pochak.android.ui.screens.intro

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.theme.*

/**
 * Location selection screen.
 *
 * Allows the user to search for their area or use current GPS location.
 * Displays a search bar, a section header with results, and a bottom
 * "현재 위치로 찾기" button.
 */

// ── Data ──

data class LocationItem(
    val id: String,
    val name: String,
    val address: String,
)

// ── Screen ──

@Composable
fun LocationScreen(
    onBackClick: () -> Unit,
    onLocationSelected: (LocationItem) -> Unit,
    onUseCurrentLocation: () -> Unit,
    locations: List<LocationItem> = emptyList(),
    currentAreaLabel: String = "",
    isLoading: Boolean = false,
) {
    var query by remember { mutableStateOf("") }
    var selectedId by remember { mutableStateOf<String?>(null) }

    val displayedLocations = remember(locations, query) {
        if (query.isBlank()) locations
        else locations.filter {
            it.name.contains(query, ignoreCase = true) ||
                it.address.contains(query, ignoreCase = true)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Location selection screen" },
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding(),
        ) {
            // ── Top bar ──
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 4.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = PochakColors.TextPrimary,
                    )
                }
                Text(
                    text = "지역 선택",
                    style = PochakTypographyTokens.Title04,
                    color = PochakColors.TextPrimary,
                )
            }

            // ── Search bar ──
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(PochakShapes.SearchBar)
                        .background(PochakColors.Surface)
                        .border(
                            width = 1.dp,
                            color = PochakColors.Border,
                            shape = PochakShapes.SearchBar,
                        )
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        imageVector = Icons.Filled.Search,
                        contentDescription = "Search",
                        tint = PochakColors.TextTertiary,
                        modifier = Modifier.size(20.dp),
                    )
                    Spacer(modifier = Modifier.width(8.dp))

                    TextField(
                        value = query,
                        onValueChange = { query = it },
                        modifier = Modifier
                            .weight(1f)
                            .semantics { contentDescription = "Location search field" },
                        placeholder = {
                            Text(
                                text = "찾으시는 지역이 없으신가요? 검색",
                                style = PochakTypographyTokens.Body03,
                                color = PochakColors.TextTertiary,
                            )
                        },
                        textStyle = PochakTypographyTokens.Body02.copy(
                            color = PochakColors.TextPrimary,
                        ),
                        singleLine = true,
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            disabledContainerColor = Color.Transparent,
                            cursorColor = PochakColors.Primary,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                        ),
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Section header ──
            val headerText = if (currentAreaLabel.isNotBlank()) {
                "현재($currentAreaLabel) 지역"
            } else if (query.isNotBlank()) {
                "\"$query\" 검색 결과"
            } else {
                "지역 목록"
            }

            Text(
                text = headerText,
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.SemiBold),
                color = PochakColors.TextSecondary,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp),
            )

            // ── Location list ──
            if (isLoading) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(
                        color = PochakColors.Primary,
                        strokeWidth = 2.dp,
                        modifier = Modifier.size(32.dp),
                    )
                }
            } else if (displayedLocations.isEmpty()) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Filled.LocationOn,
                            contentDescription = null,
                            tint = PochakColors.TextTertiary,
                            modifier = Modifier.size(48.dp),
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "검색 결과가 없습니다",
                            style = PochakTypographyTokens.Body02,
                            color = PochakColors.TextTertiary,
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "현재 위치로 찾기를 사용해보세요",
                            style = PochakTypographyTokens.Body03,
                            color = PochakColors.TextTertiary,
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentPadding = PaddingValues(horizontal = 16.dp),
                ) {
                    items(
                        items = displayedLocations,
                        key = { it.id },
                    ) { location ->
                        LocationRow(
                            item = location,
                            isSelected = location.id == selectedId,
                            onClick = {
                                selectedId = location.id
                                onLocationSelected(location)
                            },
                        )
                    }

                    // Bottom spacing for button area
                    item {
                        Spacer(modifier = Modifier.height(80.dp))
                    }
                }
            }

            // ── Bottom button ──
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PochakColors.Background)
                    .padding(horizontal = 24.dp, vertical = 16.dp),
            ) {
                PochakButton(
                    text = "현재 위치로 찾기",
                    onClick = onUseCurrentLocation,
                )
            }
        }
    }
}

// ── Components ──

@Composable
private fun LocationRow(
    item: LocationItem,
    isSelected: Boolean,
    onClick: () -> Unit,
) {
    val borderColor = if (isSelected) PochakColors.Primary else PochakColors.Border
    val bgColor = if (isSelected) PochakColors.SurfaceVariant else Color.Transparent

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clip(PochakShapes.Medium)
            .border(
                width = 1.dp,
                color = borderColor,
                shape = PochakShapes.Medium,
            )
            .background(bgColor, PochakShapes.Medium)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = Icons.Filled.LocationOn,
            contentDescription = null,
            tint = if (isSelected) PochakColors.Primary else PochakColors.TextTertiary,
            modifier = Modifier.size(20.dp),
        )

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.name,
                style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Medium),
                color = if (isSelected) PochakColors.Primary else PochakColors.TextPrimary,
            )
            if (item.address.isNotBlank()) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = item.address,
                    style = PochakTypographyTokens.Body04,
                    color = PochakColors.TextSecondary,
                )
            }
        }
    }
}

// ── Preview ──

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewLocationScreen() {
    PochakTheme {
        LocationScreen(
            onBackClick = {},
            onLocationSelected = {},
            onUseCurrentLocation = {},
            currentAreaLabel = "서울",
            locations = listOf(
                LocationItem("1", "서울특별시", "대한민국 서울"),
                LocationItem("2", "서울 강남구", "서울특별시 강남구"),
                LocationItem("3", "서울 송파구", "서울특별시 송파구"),
                LocationItem("4", "서울 마포구", "서울특별시 마포구"),
                LocationItem("5", "서울 영등포구", "서울특별시 영등포구"),
            ),
        )
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewLocationScreenEmpty() {
    PochakTheme {
        LocationScreen(
            onBackClick = {},
            onLocationSelected = {},
            onUseCurrentLocation = {},
        )
    }
}
