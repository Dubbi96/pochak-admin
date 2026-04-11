package com.pochak.android.ui.navigation

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pochak.android.ui.theme.*

/**
 * Pochak GNB -- 4 tab bottom navigation bar (Figma spec).
 * Tabs: 홈 | 일정 | 포착 | 마이
 */

enum class PochakTab(
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val description: String,
) {
    HOME("홈", Icons.Filled.Home, Icons.Outlined.Home, "Home tab"),
    SCHEDULE("일정", Icons.Filled.CalendarMonth, Icons.Outlined.CalendarMonth, "Schedule tab"),
    CLIPS("포착", Icons.Filled.PlayCircle, Icons.Outlined.PlayCircle, "Clips tab"),
    MY("마이", Icons.Filled.Person, Icons.Outlined.Person, "My page tab"),
}

@Composable
fun PochakBottomNavBar(
    selectedTab: PochakTab,
    onTabSelected: (PochakTab) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(PochakColors.GnbBackground)
                .navigationBarsPadding()
                .height(55.dp)
                .semantics { contentDescription = "Bottom navigation bar" },
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            PochakTab.entries.forEach { tab ->
                val isSelected = tab == selectedTab
                val color by animateColorAsState(
                    targetValue = if (isSelected) PochakColors.GnbSelected else PochakColors.GnbUnselected,
                    animationSpec = spring(),
                    label = "tab_color_${tab.name}",
                )

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                        ) { onTabSelected(tab) }
                        .semantics { contentDescription = tab.description },
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    Icon(
                        imageVector = if (isSelected) tab.selectedIcon else tab.unselectedIcon,
                        contentDescription = null,
                        tint = color,
                        modifier = Modifier.size(20.dp),
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = tab.label,
                        style = PochakTypographyTokens.Overline.copy(
                            fontSize = 11.sp,
                        ),
                        color = color,
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun PreviewBottomNavBar() {
    PochakTheme {
        var selectedTab by remember { mutableStateOf(PochakTab.HOME) }
        PochakBottomNavBar(
            selectedTab = selectedTab,
            onTabSelected = { selectedTab = it },
        )
    }
}
