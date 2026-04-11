// PochakModels.swift
// Pochak OTT Platform - Domain Models (placeholder data)

import Foundation

// MARK: - Video Content

struct VideoContent: Identifiable, Hashable {
    let id: String
    let title: String
    let thumbnailURL: String
    let homeTeam: String
    let awayTeam: String
    let competition: String
    let date: String
    let duration: String
    let type: ContentType
    let tags: [String]
    let viewCount: Int
    let isFree: Bool

    enum ContentType: String, Hashable {
        case live, vod, clip, scheduled
    }
}

// MARK: - Clip

struct ClipItem: Identifiable, Hashable {
    let id: String
    let title: String
    let thumbnailURL: String
    let viewCount: Int
    let sourceVideoId: String
}

// MARK: - Banner

struct BannerItem: Identifiable, Hashable {
    let id: String
    let imageURL: String
    let title: String
    let subtitle: String
    let linkTarget: String
}

// MARK: - Competition

struct Competition: Identifiable, Hashable {
    let id: String
    let name: String
    let logoURL: String
    let dateRange: String
    let category: String
}

// MARK: - Team

struct Team: Identifiable, Hashable {
    let id: String
    let name: String
    let logoURL: String
    let sport: String
    let division: String
}

// MARK: - User Profile

struct UserProfile: Identifiable {
    let id: String
    var nickname: String
    var email: String
    var avatarURL: String
    var subscriptionTier: String?
    var ppolCount: Int       // 뽈
    var ticketCount: Int     // 이용권
    var giftCount: Int       // 선물함
}

// MARK: - Schedule Entry

struct ScheduleEntry: Identifiable, Hashable {
    let id: String
    let date: String
    let dDay: String
    let matches: [VideoContent]
}

// MARK: - Placeholder Data Factory

enum SampleData {

    static let banners: [BannerItem] = [
        BannerItem(id: "b1", imageURL: "banner_1", title: "제6회 MLB컵 리틀야구 U10", subtitle: "전국리틀야구대회 라이브 중계", linkTarget: "competition_1"),
        BannerItem(id: "b2", imageURL: "banner_2", title: "포착 시즌 오픈!", subtitle: "대가족 무제한 시청권 출시", linkTarget: "subscription"),
        BannerItem(id: "b3", imageURL: "banner_3", title: "축구 전국대회 예선", subtitle: "U12 축구 실시간 중계", linkTarget: "competition_2"),
    ]

    static let liveContents: [VideoContent] = [
        VideoContent(id: "v1", title: "동대문구 리틀야구 vs 군포시 리틀야구", thumbnailURL: "thumb_live_1", homeTeam: "동대문구", awayTeam: "군포시", competition: "6회 MLB컵 리틀야구 U10", date: "2026.01.01", duration: "LIVE", type: .live, tags: ["야구", "유료", "해설"], viewCount: 342, isFree: false),
        VideoContent(id: "v2", title: "성남FC U15 vs 수원삼성 U15", thumbnailURL: "thumb_live_2", homeTeam: "성남FC", awayTeam: "수원삼성", competition: "K리그 유스컵", date: "2026.01.01", duration: "LIVE", type: .live, tags: ["축구", "유료"], viewCount: 128, isFree: false),
    ]

    static let vodContents: [VideoContent] = (1...8).map { i in
        VideoContent(
            id: "vod_\(i)",
            title: "동대문구 리틀야구 vs 군포시 리틀야구",
            thumbnailURL: "thumb_vod_\(i)",
            homeTeam: "동대문구", awayTeam: "군포시",
            competition: "6회 MLB컵 리틀야구 U10 | 준결승",
            date: "2026.01.01",
            duration: "01:30:00",
            type: .vod,
            tags: ["야구", "유료", "해설"],
            viewCount: 100,
            isFree: false
        )
    }

    static let clips: [ClipItem] = (1...6).map { i in
        ClipItem(
            id: "clip_\(i)",
            title: "스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술,...",
            thumbnailURL: "thumb_clip_\(i)",
            viewCount: 100,
            sourceVideoId: "vod_1"
        )
    }

    static let competitions: [Competition] = [
        Competition(id: "c1", name: "6회 MLB컵 리틀야구 U10", logoURL: "mlb_logo", dateRange: "2026 | 01.01 - 02.01", category: "야구"),
        Competition(id: "c2", name: "K리그 유스컵 U15", logoURL: "kleague_logo", dateRange: "2026 | 03.01 - 04.15", category: "축구"),
    ]

    static let teams: [Team] = (1...5).map { _ in
        Team(id: UUID().uuidString, name: "동대문구 리틀야구", logoURL: "team_logo", sport: "야구", division: "유소년부")
    }

    static let user = UserProfile(
        id: "u1",
        nickname: "pochak2026",
        email: "kimpochak@hogak.co.kr",
        avatarURL: "avatar_placeholder",
        subscriptionTier: "프리미엄",
        ppolCount: 1200,
        ticketCount: 3,
        giftCount: 1
    )

    static let sportTags = ["#축구", "#야구", "#배구", "#핸드볼", "#농구", "#기타"]
}
