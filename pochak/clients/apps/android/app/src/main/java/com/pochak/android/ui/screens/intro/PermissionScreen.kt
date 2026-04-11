package com.pochak.android.ui.screens.intro

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.pochak.android.ui.components.PochakButton
import com.pochak.android.ui.theme.*

/**
 * App permission introduction screen.
 *
 * Displays the list of system permissions the app requests, divided into
 * required and optional categories. The user confirms with a bottom
 * "확인" button which triggers the actual runtime permission requests.
 */

// ── Data ──

private enum class PermissionCategory { REQUIRED, OPTIONAL }

private data class PermissionItem(
    val icon: ImageVector,
    val name: String,
    val category: PermissionCategory,
    val description: String,
)

private val permissions = listOf(
    PermissionItem(
        icon = Icons.Filled.Wifi,
        name = "네트워크",
        category = PermissionCategory.REQUIRED,
        description = "콘텐츠 스트리밍 및 데이터 동기화에 필요합니다.",
    ),
    PermissionItem(
        icon = Icons.Filled.LocationOn,
        name = "GPS",
        category = PermissionCategory.REQUIRED,
        description = "내 주변 시설 및 경기 정보를 찾는 데 사용됩니다.",
    ),
    PermissionItem(
        icon = Icons.Filled.CameraAlt,
        name = "카메라",
        category = PermissionCategory.REQUIRED,
        description = "클립 촬영 및 QR 코드 인식에 사용됩니다.",
    ),
    PermissionItem(
        icon = Icons.Filled.Notifications,
        name = "알림",
        category = PermissionCategory.OPTIONAL,
        description = "경기 알림 및 이벤트 소식을 받을 수 있습니다.",
    ),
    PermissionItem(
        icon = Icons.Filled.Storage,
        name = "저장공간",
        category = PermissionCategory.REQUIRED,
        description = "영상 다운로드 및 캐시 저장에 필요합니다.",
    ),
    PermissionItem(
        icon = Icons.Filled.PhotoLibrary,
        name = "갤러리",
        category = PermissionCategory.OPTIONAL,
        description = "프로필 사진 및 커뮤니티 이미지 첨부에 사용됩니다.",
    ),
    PermissionItem(
        icon = Icons.Filled.Contacts,
        name = "연락처",
        category = PermissionCategory.OPTIONAL,
        description = "친구 초대 기능에 사용됩니다.",
    ),
    PermissionItem(
        icon = Icons.Filled.PictureInPicture,
        name = "다른 앱 위에 표시",
        category = PermissionCategory.OPTIONAL,
        description = "PIP(화면 속 화면) 재생에 사용됩니다.",
    ),
)

// ── Screen ──

@Composable
fun PermissionScreen(
    onConfirm: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(PochakColors.Background)
            .semantics { contentDescription = "Permission screen" },
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding(),
        ) {
            // ── Header ──
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .padding(top = 40.dp, bottom = 8.dp),
            ) {
                Text(
                    text = "앱 접근 권한 안내",
                    style = PochakTypographyTokens.Title03,
                    color = PochakColors.TextPrimary,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "서비스 이용을 위해 아래 권한이 필요합니다.\n선택 권한은 허용하지 않아도 서비스 이용이 가능합니다.",
                    style = PochakTypographyTokens.Body03,
                    color = PochakColors.TextSecondary,
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Permission list ──
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(0.dp),
            ) {
                // Required section
                item {
                    SectionLabel(text = "필수 접근 권한")
                }
                items(
                    items = permissions.filter { it.category == PermissionCategory.REQUIRED },
                    key = { it.name },
                ) { item ->
                    PermissionRow(item = item)
                }

                item {
                    Spacer(modifier = Modifier.height(24.dp))
                    SectionLabel(text = "선택 접근 권한")
                }
                items(
                    items = permissions.filter { it.category == PermissionCategory.OPTIONAL },
                    key = { it.name },
                ) { item ->
                    PermissionRow(item = item)
                }

                // Bottom spacing so content is not hidden behind the button
                item {
                    Spacer(modifier = Modifier.height(24.dp))
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
                    text = "확인",
                    onClick = onConfirm,
                )
            }
        }
    }
}

// ── Components ──

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text,
        style = PochakTypographyTokens.Body03.copy(fontWeight = FontWeight.SemiBold),
        color = PochakColors.Primary,
        modifier = Modifier.padding(bottom = 8.dp),
    )
}

@Composable
private fun PermissionRow(item: PermissionItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Icon circle
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(
                    color = PochakColors.SurfaceVariant,
                    shape = PochakShapes.Full,
                ),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = item.name,
                tint = PochakColors.TextPrimary,
                modifier = Modifier.size(22.dp),
            )
        }

        Spacer(modifier = Modifier.width(16.dp))

        Column(modifier = Modifier.weight(1f)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    text = item.name,
                    style = PochakTypographyTokens.Body02.copy(fontWeight = FontWeight.Medium),
                    color = PochakColors.TextPrimary,
                )
                Text(
                    text = if (item.category == PermissionCategory.REQUIRED) "필수" else "선택",
                    style = PochakTypographyTokens.Caption,
                    color = if (item.category == PermissionCategory.REQUIRED) {
                        PochakColors.Primary
                    } else {
                        PochakColors.TextTertiary
                    },
                )
            }
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = item.description,
                style = PochakTypographyTokens.Body04,
                color = PochakColors.TextSecondary,
            )
        }
    }
}

// ── Preview ──

@Preview(showBackground = true, showSystemUi = true)
@Composable
private fun PreviewPermissionScreen() {
    PochakTheme {
        PermissionScreen(onConfirm = {})
    }
}
