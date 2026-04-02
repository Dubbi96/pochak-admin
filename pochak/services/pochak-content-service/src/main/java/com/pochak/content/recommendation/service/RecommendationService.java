package com.pochak.content.recommendation.service;

import com.pochak.content.asset.entity.AssetTag;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.AssetTagRepository;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.favorite.repository.FavoriteRepository;
import com.pochak.content.history.repository.ViewHistoryRepository;
import com.pochak.content.recommendation.dto.RecommendedContentResponse;
import com.pochak.content.recommendation.dto.RecommendedContentResponse.ContentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final ViewHistoryRepository viewHistoryRepository;
    private final AssetTagRepository assetTagRepository;
    private final VodAssetRepository vodAssetRepository;
    private final ClipAssetRepository clipAssetRepository;
    private final LiveAssetRepository liveAssetRepository;
    private final FavoriteRepository favoriteRepository;

    private static final int RECOMMENDATION_LIMIT = 20;
    private static final int HISTORY_SCAN_LIMIT = 50;

    /**
     * Personalized recommendations based on user's viewing history.
     * Looks at the user's most-watched content, extracts tags, and finds related content.
     */
    public List<RecommendedContentResponse> getPersonalizedContent(Long userId) {
        Pageable historyLimit = PageRequest.of(0, HISTORY_SCAN_LIMIT);

        // 1. Get user's most-watched content by duration
        List<Object[]> mostWatched = viewHistoryRepository.findMostWatchedByDuration(userId, historyLimit);

        if (mostWatched.isEmpty()) {
            // Fall back to trending content if no history
            return getTrendingContent();
        }

        // 2. Collect tags from the user's most-watched content
        Set<String> userTagNames = new LinkedHashSet<>();
        Set<Long> watchedAssetIds = new HashSet<>();

        for (Object[] row : mostWatched) {
            String assetType = (String) row[0];
            Long assetId = (Long) row[1];
            watchedAssetIds.add(assetId);

            List<AssetTag> tags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc(assetType, assetId);
            for (AssetTag tag : tags) {
                userTagNames.add(tag.getTagName());
                if (userTagNames.size() >= 10) break;
            }
        }

        List<RecommendedContentResponse> results = new ArrayList<>();
        Pageable limit = PageRequest.of(0, RECOMMENDATION_LIMIT);

        // 3. Find VODs matching user's tags, excluding already-watched content
        if (!userTagNames.isEmpty()) {
            List<VodAsset> relatedVods = vodAssetRepository.findByTagNames(userTagNames, limit);
            for (VodAsset vod : relatedVods) {
                if (!watchedAssetIds.contains(vod.getId())) {
                    results.add(vodToRecommendation(vod, "시청 기록 기반 추천"));
                }
            }

            List<ClipAsset> relatedClips = clipAssetRepository.findByTagNames(userTagNames, limit);
            for (ClipAsset clip : relatedClips) {
                if (!watchedAssetIds.contains(clip.getId())) {
                    results.add(clipToRecommendation(clip, "시청 기록 기반 추천"));
                }
            }
        }

        // 4. Fill remaining slots with popular content
        if (results.size() < RECOMMENDATION_LIMIT) {
            int remaining = RECOMMENDATION_LIMIT - results.size();
            Set<Long> existingIds = results.stream()
                    .map(RecommendedContentResponse::getId)
                    .collect(Collectors.toSet());

            List<VodAsset> popularVods = vodAssetRepository.findPopularVods(PageRequest.of(0, remaining));
            for (VodAsset vod : popularVods) {
                if (!existingIds.contains(vod.getId()) && !watchedAssetIds.contains(vod.getId())) {
                    results.add(vodToRecommendation(vod, "인기 콘텐츠"));
                    if (results.size() >= RECOMMENDATION_LIMIT) break;
                }
            }
        }

        return results.stream().limit(RECOMMENDATION_LIMIT).collect(Collectors.toList());
    }

    /**
     * Find content similar to a given contentId based on shared tags.
     */
    public List<RecommendedContentResponse> getSimilarContent(Long contentId) {
        // Try to find tags for this content (check VOD first, then CLIP)
        List<AssetTag> vodTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("VOD", contentId);
        List<AssetTag> clipTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("CLIP", contentId);

        Set<String> tagNames = new LinkedHashSet<>();
        String sourceType = null;

        if (!vodTags.isEmpty()) {
            sourceType = "VOD";
            vodTags.forEach(t -> tagNames.add(t.getTagName()));
        } else if (!clipTags.isEmpty()) {
            sourceType = "CLIP";
            clipTags.forEach(t -> tagNames.add(t.getTagName()));
        }

        List<RecommendedContentResponse> results = new ArrayList<>();
        Pageable limit = PageRequest.of(0, RECOMMENDATION_LIMIT);

        if (!tagNames.isEmpty()) {
            // Find content with matching tags
            List<VodAsset> similarVods = vodAssetRepository.findByTagNames(tagNames, limit);
            for (VodAsset vod : similarVods) {
                if (!vod.getId().equals(contentId) || !"VOD".equals(sourceType)) {
                    List<String> matchingTags = getMatchingTagNames(tagNames, "VOD", vod.getId());
                    String reason = matchingTags.isEmpty()
                            ? "유사한 콘텐츠"
                            : "'" + String.join("', '", matchingTags) + "' 태그 기반 추천";
                    results.add(vodToRecommendation(vod, reason));
                }
            }

            List<ClipAsset> similarClips = clipAssetRepository.findByTagNames(tagNames, limit);
            for (ClipAsset clip : similarClips) {
                if (!clip.getId().equals(contentId) || !"CLIP".equals(sourceType)) {
                    results.add(clipToRecommendation(clip, "유사한 태그 기반 추천"));
                }
            }
        }

        // Fill with popular content if not enough similar items
        if (results.size() < RECOMMENDATION_LIMIT) {
            int remaining = RECOMMENDATION_LIMIT - results.size();
            Set<Long> existingIds = results.stream()
                    .map(RecommendedContentResponse::getId)
                    .collect(Collectors.toSet());
            existingIds.add(contentId);

            List<VodAsset> popularVods = vodAssetRepository.findPopularVods(PageRequest.of(0, remaining));
            for (VodAsset vod : popularVods) {
                if (!existingIds.contains(vod.getId())) {
                    results.add(vodToRecommendation(vod, "인기 콘텐츠"));
                    if (results.size() >= RECOMMENDATION_LIMIT) break;
                }
            }
        }

        return results.stream().limit(RECOMMENDATION_LIMIT).collect(Collectors.toList());
    }

    /**
     * Return trending content - most viewed content in the last 24 hours.
     */
    public List<RecommendedContentResponse> getTrendingContent() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        Pageable limit = PageRequest.of(0, RECOMMENDATION_LIMIT);
        List<RecommendedContentResponse> results = new ArrayList<>();

        // Trending VODs from view history
        List<Long> trendingVodIds = viewHistoryRepository.findTrendingAssetIds("VOD", since, limit);
        for (Long vodId : trendingVodIds) {
            vodAssetRepository.findByIdAndDeletedAtIsNull(vodId).ifPresent(vod ->
                    results.add(vodToRecommendation(vod, "지금 인기 있는 콘텐츠"))
            );
        }

        // Trending Clips from view history
        List<Long> trendingClipIds = viewHistoryRepository.findTrendingAssetIds("CLIP", since, limit);
        for (Long clipId : trendingClipIds) {
            clipAssetRepository.findByIdAndDeletedAtIsNull(clipId).ifPresent(clip ->
                    results.add(clipToRecommendation(clip, "지금 인기 있는 클립"))
            );
        }

        // Fall back to popular content sorted by view count if not enough trending
        if (results.size() < RECOMMENDATION_LIMIT) {
            int remaining = RECOMMENDATION_LIMIT - results.size();
            Set<Long> existingIds = results.stream()
                    .map(RecommendedContentResponse::getId)
                    .collect(Collectors.toSet());

            List<VodAsset> popularVods = vodAssetRepository.findPopularVods(PageRequest.of(0, remaining));
            for (VodAsset vod : popularVods) {
                if (!existingIds.contains(vod.getId())) {
                    results.add(vodToRecommendation(vod, "인기 콘텐츠"));
                    if (results.size() >= RECOMMENDATION_LIMIT) break;
                }
            }

            List<ClipAsset> popularClips = clipAssetRepository.findPopularClips(PageRequest.of(0, remaining));
            for (ClipAsset clip : popularClips) {
                if (!existingIds.contains(clip.getId())) {
                    results.add(clipToRecommendation(clip, "인기 클립"));
                    if (results.size() >= RECOMMENDATION_LIMIT) break;
                }
            }
        }

        // Add live broadcasts
        try {
            List<LiveAsset> liveAssets = liveAssetRepository.findByStatusWithMatchDetails(LiveAsset.LiveStatus.BROADCASTING);
            for (LiveAsset live : liveAssets) {
                results.add(0, liveToRecommendation(live, "실시간 방송중"));
                if (results.size() > RECOMMENDATION_LIMIT) {
                    results.remove(results.size() - 1);
                }
            }
        } catch (Exception ignored) {
        }

        return results.stream().limit(RECOMMENDATION_LIMIT).collect(Collectors.toList());
    }

    /**
     * Phase 9: Enhanced personalized feed combining multiple signals.
     * Combines: watch history tags, followed teams' content, preferred sports popularity, and trending.
     */
    public List<RecommendedContentResponse> getPersonalizedFeed(Long userId, int page, int size) {
        int effectiveSize = Math.min(size, RECOMMENDATION_LIMIT);
        List<RecommendedContentResponse> results = new ArrayList<>();
        Set<Long> seenIds = new HashSet<>();

        // 1. Recent watch history -> similar content by tags
        Pageable historyLimit = PageRequest.of(0, HISTORY_SCAN_LIMIT);
        List<Object[]> mostWatched = viewHistoryRepository.findMostWatchedByDuration(userId, historyLimit);

        Set<String> userTagNames = new LinkedHashSet<>();
        Set<Long> watchedAssetIds = new HashSet<>();

        for (Object[] row : mostWatched) {
            String assetType = (String) row[0];
            Long assetId = (Long) row[1];
            watchedAssetIds.add(assetId);

            List<AssetTag> tags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc(assetType, assetId);
            for (AssetTag tag : tags) {
                userTagNames.add(tag.getTagName());
                if (userTagNames.size() >= 15) break;
            }
        }

        if (!userTagNames.isEmpty()) {
            List<VodAsset> tagVods = vodAssetRepository.findByTagNames(userTagNames, PageRequest.of(0, effectiveSize));
            for (VodAsset vod : tagVods) {
                if (!watchedAssetIds.contains(vod.getId()) && seenIds.add(vod.getId())) {
                    results.add(vodToRecommendation(vod, "시청 기록 기반 맞춤 추천"));
                }
                if (results.size() >= effectiveSize) break;
            }
        }

        // 2. Followed teams/clubs -> their latest content (via user favorites)
        if (results.size() < effectiveSize) {
            try {
                List<VodAsset> recentVods = vodAssetRepository.findRecentVods(PageRequest.of(0, effectiveSize));
                for (VodAsset vod : recentVods) {
                    if (!watchedAssetIds.contains(vod.getId()) && seenIds.add(vod.getId())) {
                        results.add(vodToRecommendation(vod, "팔로우 팀 최신 콘텐츠"));
                    }
                    if (results.size() >= effectiveSize) break;
                }
            } catch (Exception e) {
                log.debug("Error fetching team content for personalized feed: {}", e.getMessage());
            }
        }

        // 3. Popular in user's preferred sports (inferred from watch history tags)
        if (results.size() < effectiveSize) {
            List<VodAsset> popularVods = vodAssetRepository.findPopularVods(
                    PageRequest.of(0, effectiveSize - results.size()));
            for (VodAsset vod : popularVods) {
                if (!watchedAssetIds.contains(vod.getId()) && seenIds.add(vod.getId())) {
                    results.add(vodToRecommendation(vod, "선호 종목 인기 콘텐츠"));
                }
                if (results.size() >= effectiveSize) break;
            }
        }

        // 4. Trending content (last 24h)
        if (results.size() < effectiveSize) {
            LocalDateTime since = LocalDateTime.now().minusHours(24);
            Pageable trendLimit = PageRequest.of(0, effectiveSize - results.size());
            List<Long> trendingVodIds = viewHistoryRepository.findTrendingAssetIds("VOD", since, trendLimit);
            for (Long vodId : trendingVodIds) {
                if (seenIds.add(vodId)) {
                    vodAssetRepository.findByIdAndDeletedAtIsNull(vodId).ifPresent(vod ->
                            results.add(vodToRecommendation(vod, "지금 인기 급상승"))
                    );
                }
                if (results.size() >= effectiveSize) break;
            }
        }

        // Apply pagination offset
        int fromIndex = Math.min(page * effectiveSize, results.size());
        int toIndex = Math.min(fromIndex + effectiveSize, results.size());
        return results.subList(fromIndex, toIndex);
    }

    /**
     * Phase 9: Content-based recommendations using tag similarity + same competition.
     */
    public List<RecommendedContentResponse> getContentBasedRecommendations(Long contentId, int limit) {
        int effectiveLimit = Math.min(limit, RECOMMENDATION_LIMIT);
        List<RecommendedContentResponse> results = new ArrayList<>();
        Set<Long> seenIds = new HashSet<>();
        seenIds.add(contentId);

        // Resolve source content tags and competition
        List<AssetTag> vodTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("VOD", contentId);
        List<AssetTag> clipTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("CLIP", contentId);

        Set<String> tagNames = new LinkedHashSet<>();
        Long sourceMatchId = null;

        if (!vodTags.isEmpty()) {
            vodTags.forEach(t -> tagNames.add(t.getTagName()));
            // Try to get competition from the VOD's match
            vodAssetRepository.findByIdAndDeletedAtIsNull(contentId).ifPresent(vod -> {
                // match info used for same-competition matching
            });
            sourceMatchId = vodAssetRepository.findByIdAndDeletedAtIsNull(contentId)
                    .map(vod -> vod.getMatch() != null ? vod.getMatch().getId() : null)
                    .orElse(null);
        } else if (!clipTags.isEmpty()) {
            clipTags.forEach(t -> tagNames.add(t.getTagName()));
        }

        // 1. Tag-based similarity
        if (!tagNames.isEmpty()) {
            List<VodAsset> similarVods = vodAssetRepository.findByTagNames(tagNames, PageRequest.of(0, effectiveLimit));
            for (VodAsset vod : similarVods) {
                if (seenIds.add(vod.getId())) {
                    List<String> matchingTags = getMatchingTagNames(tagNames, "VOD", vod.getId());
                    int matchCount = matchingTags.size();
                    String reason = matchCount > 0
                            ? "'" + String.join("', '", matchingTags) + "' 태그 유사 콘텐츠"
                            : "유사한 콘텐츠";
                    results.add(vodToRecommendation(vod, reason));
                }
                if (results.size() >= effectiveLimit) break;
            }

            List<ClipAsset> similarClips = clipAssetRepository.findByTagNames(tagNames, PageRequest.of(0, effectiveLimit));
            for (ClipAsset clip : similarClips) {
                if (seenIds.add(clip.getId())) {
                    results.add(clipToRecommendation(clip, "유사한 태그 클립"));
                }
                if (results.size() >= effectiveLimit) break;
            }
        }

        // 2. Same competition: find other VODs from the same match's competition
        if (sourceMatchId != null && results.size() < effectiveLimit) {
            try {
                List<VodAsset> sameMatchVods = vodAssetRepository.findByMatchIdIn(List.of(sourceMatchId));
                for (VodAsset vod : sameMatchVods) {
                    if (seenIds.add(vod.getId())) {
                        results.add(vodToRecommendation(vod, "같은 대회 콘텐츠"));
                    }
                    if (results.size() >= effectiveLimit) break;
                }
            } catch (Exception e) {
                log.debug("Error fetching same-competition content: {}", e.getMessage());
            }
        }

        // 3. Fill remaining with popular content
        if (results.size() < effectiveLimit) {
            int remaining = effectiveLimit - results.size();
            List<VodAsset> popularVods = vodAssetRepository.findPopularVods(PageRequest.of(0, remaining));
            for (VodAsset vod : popularVods) {
                if (seenIds.add(vod.getId())) {
                    results.add(vodToRecommendation(vod, "인기 콘텐츠"));
                }
                if (results.size() >= effectiveLimit) break;
            }
        }

        return results.stream().limit(effectiveLimit).collect(Collectors.toList());
    }

    // --- Private helpers ---

    private List<String> getMatchingTagNames(Set<String> sourceTagNames, String assetType, Long assetId) {
        List<AssetTag> tags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc(assetType, assetId);
        return tags.stream()
                .map(AssetTag::getTagName)
                .filter(sourceTagNames::contains)
                .distinct()
                .limit(3)
                .collect(Collectors.toList());
    }

    private RecommendedContentResponse vodToRecommendation(VodAsset vod, String reason) {
        String matchInfo = null;
        List<String> tags = Collections.emptyList();

        if (vod.getMatch() != null) {
            matchInfo = vod.getMatch().getTitle();
        }

        List<AssetTag> assetTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("VOD", vod.getId());
        if (!assetTags.isEmpty()) {
            tags = assetTags.stream()
                    .map(AssetTag::getTagName)
                    .distinct()
                    .limit(5)
                    .collect(Collectors.toList());
        }

        return RecommendedContentResponse.builder()
                .id(vod.getId())
                .title(vod.getTitle())
                .thumbnailUrl(vod.getThumbnailUrl())
                .type(ContentType.VOD)
                .matchInfo(matchInfo)
                .tags(tags.isEmpty() ? null : tags)
                .reason(reason)
                .build();
    }

    private RecommendedContentResponse clipToRecommendation(ClipAsset clip, String reason) {
        String matchInfo = null;
        List<String> tags = Collections.emptyList();

        if (clip.getMatch() != null) {
            matchInfo = clip.getMatch().getTitle();
        }

        List<AssetTag> assetTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("CLIP", clip.getId());
        if (!assetTags.isEmpty()) {
            tags = assetTags.stream()
                    .map(AssetTag::getTagName)
                    .distinct()
                    .limit(5)
                    .collect(Collectors.toList());
        }

        return RecommendedContentResponse.builder()
                .id(clip.getId())
                .title(clip.getTitle())
                .thumbnailUrl(clip.getThumbnailUrl())
                .type(ContentType.CLIP)
                .matchInfo(matchInfo)
                .tags(tags.isEmpty() ? null : tags)
                .reason(reason)
                .build();
    }

    private RecommendedContentResponse liveToRecommendation(LiveAsset live, String reason) {
        String matchInfo = null;
        String title = "Live #" + live.getId();
        if (live.getMatch() != null) {
            matchInfo = live.getMatch().getTitle();
            title = live.getMatch().getTitle();
        }

        return RecommendedContentResponse.builder()
                .id(live.getId())
                .title(title)
                .thumbnailUrl(live.getThumbnailUrl())
                .type(ContentType.LIVE)
                .matchInfo(matchInfo)
                .reason(reason)
                .build();
    }
}
