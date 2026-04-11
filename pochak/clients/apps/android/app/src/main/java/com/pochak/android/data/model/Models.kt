package com.pochak.android.data.model

/**
 * Placeholder data models for Pochak Android UI.
 */

enum class ContentType { LIVE, VOD, CLIP, SCHEDULED }

data class BannerItem(
    val id: Long,
    val imageUrl: String,
    val title: String,
    val subtitle: String,
)

data class LiveContent(
    val id: Long,
    val thumbnailUrl: String,
    val teamHome: String,
    val teamAway: String,
    val competitionName: String,
    val viewerCount: Int,
)

data class VideoContent(
    val id: Long,
    val thumbnailUrl: String,
    val title: String,
    val competitionName: String,
    val competitionLogoUrl: String,
    val date: String,
    val type: ContentType,
    val tags: List<String> = emptyList(),
    val isFree: Boolean = false,
    val duration: String = "",
)

data class ClipContent(
    val id: Long,
    val thumbnailUrl: String,
    val title: String,
    val viewCount: Int,
)

enum class MatchStatus { LIVE, UPCOMING, COMPLETED }

data class MatchInfo(
    val id: Long,
    val homeTeam: String,
    val awayTeam: String,
    val homeTeamLogo: String,
    val awayTeamLogo: String,
    val homeScore: Int? = null,
    val awayScore: Int? = null,
    val competitionName: String,
    val date: String,
    val time: String = "",
    val round: String = "",
    val status: MatchStatus = MatchStatus.COMPLETED,
    val tags: List<String>,
    val thumbnailUrl: String = "",
    val hasVideo: Boolean = true,
)

data class CompetitionInfo(
    val id: Long,
    val name: String,
    val imageUrl: String,
    val dateRange: String,
    val tags: List<String> = emptyList(),
    val sportType: String = "",
)

data class TeamClub(
    val id: Long,
    val name: String,
    val logoUrl: String,
    val sportType: String,
    val division: String = "",
)

data class ClipFeedItem(
    val id: Long,
    val videoUrl: String,
    val thumbnailUrl: String,
    val title: String,
    val authorName: String,
    val authorAvatarUrl: String,
    val competitionName: String,
    val likeCount: Int,
    val commentCount: Int,
    val shareCount: Int,
    val isLiked: Boolean = false,
)

data class UserProfile(
    val nickname: String,
    val email: String,
    val avatarUrl: String,
    val subscriptionName: String?,
    val nextPaymentDate: String?,
    val polBalance: Int = 0,
    val giftPolBalance: Int = 0,
    val ticketCount: Int = 0,
    val giftBoxCount: Int = 0,
)

data class Comment(
    val id: Long,
    val author: String,
    val content: String,
    val timestamp: String,
    val avatarUrl: String,
)

/**
 * Sample data for previews and placeholder rendering.
 */
object SampleData {
    val banners = listOf(
        BannerItem(1, "", "6th MLB Cup", "Little League Baseball U10"),
        BannerItem(2, "", "Spring Tournament", "Handball Championship 2026"),
        BannerItem(3, "", "City League Finals", "Soccer U12 Semifinals"),
    )

    val liveContents = listOf(
        LiveContent(1, "", "Dongdaemun Little", "Gunpo City Little", "6th MLB Cup Little Baseball U10", 342),
        LiveContent(2, "", "Seoul FC Academy", "Incheon Youth", "Spring Soccer League U14", 128),
        LiveContent(3, "", "Suwon Handball", "Busan Hawks", "National Handball Tournament", 89),
    )

    val videoContents = listOf(
        VideoContent(
            1, "", "Dongdaemun Little vs Gunpo City Little",
            "6th MLB Cup Little Baseball U10", "", "2026.01.01",
            ContentType.VOD, listOf("Baseball", "Paid", "Commentary"), duration = "01:30:00"
        ),
        VideoContent(
            2, "", "Seoul FC Academy vs Incheon Youth",
            "Spring Soccer League U14", "", "2026.01.02",
            ContentType.VOD, listOf("Soccer", "Free"), isFree = true, duration = "01:45:00"
        ),
        VideoContent(
            3, "", "Suwon Handball vs Busan Hawks",
            "National Handball Tournament", "", "2026.01.03",
            ContentType.SCHEDULED, listOf("Handball", "Paid"), duration = ""
        ),
    )

    val clipContents = listOf(
        ClipContent(1, "", "Best play of the match - Amazing catch!", 100),
        ClipContent(2, "", "Winning home run in the finals", 256),
        ClipContent(3, "", "Incredible save by goalkeeper", 89),
        ClipContent(4, "", "Championship celebration moment", 412),
    )

    val userProfile = UserProfile(
        nickname = "pochak2026",
        email = "kimpochak@hogak.co.kr",
        avatarUrl = "",
        subscriptionName = "Family Unlimited Plan",
        nextPaymentDate = "2026.02.01",
        polBalance = 1500,
        giftPolBalance = 300,
        ticketCount = 2,
        giftBoxCount = 1,
    )

    val comments = listOf(
        Comment(1, "sportsLover", "Great match! The defense was outstanding.", "2m ago", ""),
        Comment(2, "baseballFan99", "What an incredible play in the 7th inning!", "5m ago", ""),
        Comment(3, "parentViewer", "So proud of the kids!", "12m ago", ""),
    )

    val competitions = listOf(
        CompetitionInfo(1, "6회 MLB컵 리틀야구 U10", "", "2026.01.01 ~ 02.01", listOf("야구", "유료", "해설"), "야구"),
        CompetitionInfo(2, "2026 춘계 전국축구대회", "", "2026.02.15 ~ 03.15", listOf("축구", "무료"), "축구"),
        CompetitionInfo(3, "106회 전국체육대회 (배구)", "", "2026.03.01 ~ 03.20", listOf("배구", "유료"), "배구"),
        CompetitionInfo(4, "제5회 전국핸드볼 선수권", "", "2026.04.01 ~ 04.15", listOf("핸드볼", "유료", "해설"), "핸드볼"),
    )

    val matches = listOf(
        MatchInfo(
            1, "동대문리틀", "군포시리틀", "", "", 5, 2,
            "6회 MLB컵 리틀야구 U10", "2026.01.01", "14:00", "준결승",
            MatchStatus.COMPLETED, listOf("야구", "유료"), hasVideo = true,
        ),
        MatchInfo(
            2, "서울FC아카데미", "인천유소년", "", "", null, null,
            "2026 춘계 전국축구대회", "2026.01.01", "16:00", "8강",
            MatchStatus.LIVE, listOf("축구", "무료"), hasVideo = true,
        ),
        MatchInfo(
            3, "수원핸드볼", "부산호크스", "", "", null, null,
            "제5회 전국핸드볼 선수권", "2026.01.02", "10:00", "조별리그",
            MatchStatus.UPCOMING, listOf("핸드볼", "유료"), hasVideo = false,
        ),
        MatchInfo(
            4, "강남리틀", "부천리틀", "", "", 3, 7,
            "6회 MLB컵 리틀야구 U10", "2026.01.01", "11:00", "준결승 | 승부차기(3-2)",
            MatchStatus.COMPLETED, listOf("야구", "유료"), hasVideo = true,
        ),
        MatchInfo(
            5, "대전유소년", "광주유소년", "", "", null, null,
            "2026 춘계 전국축구대회", "2026.01.02", "13:00", "4강",
            MatchStatus.UPCOMING, listOf("축구", "무료"), hasVideo = false,
        ),
    )

    val teamClubs = listOf(
        TeamClub(1, "동대문리틀야구단", "", "야구", "유소년부"),
        TeamClub(2, "서울FC아카데미", "", "축구", "U14"),
        TeamClub(3, "수원핸드볼클럽", "", "핸드볼", "일반부"),
        TeamClub(4, "인천유소년축구단", "", "축구", "U12"),
        TeamClub(5, "부산호크스", "", "핸드볼", "유소년부"),
        TeamClub(6, "강남리틀야구단", "", "야구", "유소년부"),
    )

    val clipFeedItems = listOf(
        ClipFeedItem(
            1, "", "", "역대급 홈런! 결승전 9회말 끝내기",
            "야구사랑", "", "6회 MLB컵 리틀야구 U10",
            1243, 89, 234, false,
        ),
        ClipFeedItem(
            2, "", "", "골키퍼 슈퍼 세이브 모음",
            "축구팬99", "", "2026 춘계 전국축구대회",
            892, 56, 123, true,
        ),
        ClipFeedItem(
            3, "", "", "배구 결승전 매치포인트 랠리",
            "배구매니아", "", "106회 전국체육대회 (배구)",
            2156, 142, 567, false,
        ),
        ClipFeedItem(
            4, "", "", "핸드볼 속공 카운터 득점 장면",
            "스포츠하이라이트", "", "제5회 전국핸드볼 선수권",
            634, 28, 89, false,
        ),
        ClipFeedItem(
            5, "", "", "우승 확정 순간! 선수들의 환호",
            "감동영상", "", "6회 MLB컵 리틀야구 U10",
            3421, 256, 891, true,
        ),
    )
}
