package com.pochak.android.ui.screens.signup

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakTextField
import com.pochak.android.ui.theme.*

// ────────────────────────────────────────────────────────
// AdditionalInfo1Screen -- 관심지역 선택
// ────────────────────────────────────────────────────────

@Composable
fun AdditionalInfo1Screen(
    onBackClick: () -> Unit = {},
    onSkipClick: () -> Unit = {},
    onNextClick: (List<String>) -> Unit = {},
    onSearchAddress: (String, (List<String>) -> Unit) -> Unit = { _, cb -> cb(emptyList()) },
) {
    var searchQuery by remember { mutableStateOf("") }
    var searchResults by remember { mutableStateOf<List<String>>(emptyList()) }
    var showResults by remember { mutableStateOf(false) }
    val selectedLocations = remember {
        mutableStateListOf<String>()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Interest area selection screen" },
    ) {
        // ── Top Bar ──
        SignUpTopBar(
            onBackClick = onBackClick,
            trailingContent = {
                Text(
                    text = "건너뛰기",
                    style = PochakTypographyTokens.Body02,
                    color = PochakColors.TextSecondary,
                    modifier = Modifier
                        .clickable(onClick = onSkipClick)
                        .padding(end = 8.dp),
                )
            },
        )

        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 24.dp),
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // ── Title ──
            Text(
                text = "관심지역 선택",
                style = PochakTypographyTokens.Title03,
                color = PochakColors.TextPrimary,
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "설정한 지역의 대회, 팀 정보를 제공드려요.",
                style = PochakTypographyTokens.Body02,
                color = PochakColors.TextSecondary,
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Search bar ──
            OutlinedTextField(
                value = searchQuery,
                onValueChange = {
                    searchQuery = it
                    if (it.length >= 2) {
                        onSearchAddress(it) { results ->
                            searchResults = results
                            showResults = results.isNotEmpty()
                        }
                    } else {
                        showResults = false
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                placeholder = {
                    Text(
                        text = "주소검색",
                        color = PochakColors.TextTertiary,
                        style = PochakTypographyTokens.Body02,
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Filled.Search,
                        contentDescription = null,
                        tint = PochakColors.TextTertiary,
                    )
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = PochakColors.TextPrimary,
                    unfocusedTextColor = PochakColors.TextPrimary,
                    cursorColor = PochakColors.Primary,
                    focusedBorderColor = PochakColors.Primary,
                    unfocusedBorderColor = PochakColors.BorderLight,
                    focusedContainerColor = androidx.compose.ui.graphics.Color.Transparent,
                    unfocusedContainerColor = androidx.compose.ui.graphics.Color.Transparent,
                ),
                shape = PochakShapes.SearchBar,
                textStyle = PochakTypographyTokens.Body02.copy(color = PochakColors.TextPrimary),
                singleLine = true,
            )

            // ── Search results dropdown ──
            if (showResults) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = PochakShapes.Base,
                    colors = CardDefaults.cardColors(containerColor = PochakColors.Surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                ) {
                    Column {
                        searchResults.take(5).forEach { result ->
                            Text(
                                text = result,
                                style = PochakTypographyTokens.Body02,
                                color = PochakColors.TextPrimary,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        if (!selectedLocations.contains(result)) {
                                            selectedLocations.add(result)
                                        }
                                        searchQuery = ""
                                        showResults = false
                                    }
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Selected locations ──
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(
                    items = selectedLocations.toList(),
                    key = { it },
                ) { location ->
                    LocationChip(
                        text = location,
                        onRemove = { selectedLocations.remove(location) },
                    )
                }
            }
        }

        // ── Bottom Bar ──
        AdditionalInfoBottomBar(
            stepLabel = "추가정보 1 / 3",
            buttonText = "다음",
            onButtonClick = { onNextClick(selectedLocations.toList()) },
        )
    }
}

@Composable
private fun LocationChip(
    text: String,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = 1.dp,
                color = PochakColors.Border,
                shape = PochakShapes.Base,
            )
            .padding(horizontal = 12.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = Icons.Filled.LocationOn,
            contentDescription = null,
            tint = PochakColors.Primary,
            modifier = Modifier.size(18.dp),
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = text,
            style = PochakTypographyTokens.Body02,
            color = PochakColors.TextPrimary,
            modifier = Modifier.weight(1f),
        )
        IconButton(
            onClick = onRemove,
            modifier = Modifier.size(24.dp),
        ) {
            Icon(
                imageVector = Icons.Filled.Close,
                contentDescription = "Remove $text",
                tint = PochakColors.TextTertiary,
                modifier = Modifier.size(16.dp),
            )
        }
    }
}

// ────────────────────────────────────────────────────────
// Preview
// ────────────────────────────────────────────────────────

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewAdditionalInfo1Screen() {
    PochakTheme {
        AdditionalInfo1Screen()
    }
}
