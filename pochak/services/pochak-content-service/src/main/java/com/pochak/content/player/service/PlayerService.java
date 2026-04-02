package com.pochak.content.player.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.asset.entity.AssetTag;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.AssetTagRepository;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.home.dto.ContentCard;
import com.pochak.content.player.dto.PlayerDetailResponse;
import com.pochak.content.player.dto.PlayerMatchInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerService {

    private static final int RELATED_LIVE_LIMIT = 5;
    private static final int RELATED_CLIPS_LIMIT = 10;
    private static final int RELATED_VODS_LIMIT = 10;
    private static final int RECOMMENDED_LIMIT = 10;

    private final LiveAssetRepository liveAssetRepository;
    private final VodAssetRepository vodAssetRepository;
    private final ClipAssetRepository clipAssetRepository;
    private final AssetTagRepository assetTagRepository;

    public PlayerDetailResponse getLivePlayerDetail(Long id) {
        LiveAsset live = liveAssetRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "LiveAsset not found: " + id));

        Match match = live.getMatch();
        PlayerMatchInfo matchInfo = PlayerMatchInfo.from(match);

        // Tags for this asset
        List<AssetTag> assetTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("LIVE", id);
        List<String> tagNames = assetTags.stream().map(AssetTag::getTagName).distinct().toList();

        // Related live: same competition, currently broadcasting
        List<ContentCard> relatedLive = List.of();
        if (match != null && match.getCompetition() != null) {
            relatedLive = liveAssetRepository
                    .findLiveByCompetitionId(match.getCompetition().getId(), PageRequest.of(0, RELATED_LIVE_LIMIT))
                    .stream()
                    .filter(la -> !la.getId().equals(id))
                    .map(ContentCard::fromLive)
                    .toList();
        }

        // User clips for this match
        List<ContentCard> userClips = List.of();
        if (match != null) {
            userClips = clipAssetRepository
                    .findByMatchIdAndDeletedAtIsNull(match.getId(), PageRequest.of(0, RELATED_CLIPS_LIMIT))
                    .stream()
                    .map(ContentCard::fromClip)
                    .toList();
        }

        // Tag-based related clips and VODs
        List<ContentCard> relatedClips = findRelatedClipsByTags(tagNames);
        List<ContentCard> relatedVods = findRelatedVodsByTags(tagNames);

        // Recommended: mix of latest clips and VODs by tags
        List<ContentCard> recommended = buildRecommended(tagNames);

        Map<String, Object> assetMap = buildLiveAssetMap(live);

        return PlayerDetailResponse.builder()
                .asset(assetMap)
                .matchInfo(matchInfo)
                .tags(tagNames)
                .relatedLive(relatedLive)
                .userClips(userClips)
                .relatedClips(relatedClips)
                .relatedVods(relatedVods)
                .recommendedContents(recommended)
                .build();
    }

    public PlayerDetailResponse getVodPlayerDetail(Long id) {
        VodAsset vod = vodAssetRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "VodAsset not found: " + id));

        Match match = vod.getMatch();
        PlayerMatchInfo matchInfo = PlayerMatchInfo.from(match);

        List<AssetTag> assetTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("VOD", id);
        List<String> tagNames = assetTags.stream().map(AssetTag::getTagName).distinct().toList();

        List<ContentCard> relatedLive = List.of();
        if (match != null && match.getCompetition() != null) {
            relatedLive = liveAssetRepository
                    .findLiveByCompetitionId(match.getCompetition().getId(), PageRequest.of(0, RELATED_LIVE_LIMIT))
                    .stream()
                    .map(ContentCard::fromLive)
                    .toList();
        }

        List<ContentCard> userClips = List.of();
        if (match != null) {
            userClips = clipAssetRepository
                    .findByMatchIdAndDeletedAtIsNull(match.getId(), PageRequest.of(0, RELATED_CLIPS_LIMIT))
                    .stream()
                    .map(ContentCard::fromClip)
                    .toList();
        }

        List<ContentCard> relatedClips = findRelatedClipsByTags(tagNames);
        List<ContentCard> relatedVods = findRelatedVodsByTags(tagNames);
        List<ContentCard> recommended = buildRecommended(tagNames);

        Map<String, Object> assetMap = buildVodAssetMap(vod);

        return PlayerDetailResponse.builder()
                .asset(assetMap)
                .matchInfo(matchInfo)
                .tags(tagNames)
                .relatedLive(relatedLive)
                .userClips(userClips)
                .relatedClips(relatedClips)
                .relatedVods(relatedVods)
                .recommendedContents(recommended)
                .build();
    }

    public PlayerDetailResponse getClipPlayerDetail(Long id) {
        ClipAsset clip = clipAssetRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "ClipAsset not found: " + id));

        Match match = clip.getMatch();
        PlayerMatchInfo matchInfo = PlayerMatchInfo.from(match);

        List<AssetTag> assetTags = assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("CLIP", id);
        List<String> tagNames = assetTags.stream().map(AssetTag::getTagName).distinct().toList();

        List<ContentCard> relatedLive = List.of();
        if (match != null && match.getCompetition() != null) {
            relatedLive = liveAssetRepository
                    .findLiveByCompetitionId(match.getCompetition().getId(), PageRequest.of(0, RELATED_LIVE_LIMIT))
                    .stream()
                    .map(ContentCard::fromLive)
                    .toList();
        }

        List<ContentCard> userClips = List.of();
        if (match != null) {
            userClips = clipAssetRepository
                    .findByMatchIdAndDeletedAtIsNull(match.getId(), PageRequest.of(0, RELATED_CLIPS_LIMIT))
                    .stream()
                    .filter(ca -> !ca.getId().equals(id))
                    .map(ContentCard::fromClip)
                    .toList();
        }

        List<ContentCard> relatedClips = findRelatedClipsByTags(tagNames);
        List<ContentCard> relatedVods = findRelatedVodsByTags(tagNames);
        List<ContentCard> recommended = buildRecommended(tagNames);

        Map<String, Object> assetMap = buildClipAssetMap(clip);

        return PlayerDetailResponse.builder()
                .asset(assetMap)
                .matchInfo(matchInfo)
                .tags(tagNames)
                .relatedLive(relatedLive)
                .userClips(userClips)
                .relatedClips(relatedClips)
                .relatedVods(relatedVods)
                .recommendedContents(recommended)
                .build();
    }

    private List<ContentCard> findRelatedClipsByTags(List<String> tagNames) {
        if (tagNames.isEmpty()) return List.of();
        return clipAssetRepository.findByTagNames(tagNames, PageRequest.of(0, RELATED_CLIPS_LIMIT))
                .stream()
                .map(ContentCard::fromClip)
                .toList();
    }

    private List<ContentCard> findRelatedVodsByTags(List<String> tagNames) {
        if (tagNames.isEmpty()) return List.of();
        return vodAssetRepository.findByTagNames(tagNames, PageRequest.of(0, RELATED_VODS_LIMIT))
                .stream()
                .map(ContentCard::fromVod)
                .toList();
    }

    private List<ContentCard> buildRecommended(List<String> tagNames) {
        List<ContentCard> recommended = new ArrayList<>();

        if (!tagNames.isEmpty()) {
            // Mix clips and VODs by tags
            List<ContentCard> clips = clipAssetRepository
                    .findByTagNames(tagNames, PageRequest.of(0, RECOMMENDED_LIMIT / 2))
                    .stream()
                    .map(ContentCard::fromClip)
                    .toList();
            List<ContentCard> vods = vodAssetRepository
                    .findByTagNames(tagNames, PageRequest.of(0, RECOMMENDED_LIMIT / 2))
                    .stream()
                    .map(ContentCard::fromVod)
                    .toList();
            recommended.addAll(clips);
            recommended.addAll(vods);
        }

        // Fill remaining with popular content
        if (recommended.size() < RECOMMENDED_LIMIT) {
            int remaining = RECOMMENDED_LIMIT - recommended.size();
            Set<Long> existingClipIds = recommended.stream()
                    .filter(c -> c.getType() == ContentCard.ContentType.CLIP)
                    .map(ContentCard::getId)
                    .collect(Collectors.toSet());

            clipAssetRepository.findPopularClips(PageRequest.of(0, remaining))
                    .stream()
                    .filter(c -> !existingClipIds.contains(c.getId()))
                    .map(ContentCard::fromClip)
                    .limit(remaining)
                    .forEach(recommended::add);
        }

        return recommended.stream().limit(RECOMMENDED_LIMIT).toList();
    }

    private Map<String, Object> buildLiveAssetMap(LiveAsset live) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", live.getId());
        map.put("type", "LIVE");
        map.put("streamUrl", live.getStreamUrl());
        map.put("panoramaUrl", live.getPanoramaUrl());
        map.put("hdUrl", live.getHdUrl());
        map.put("thumbnailUrl", live.getThumbnailUrl());
        map.put("status", live.getStatus().name());
        map.put("viewCount", live.getViewCount());
        map.put("startTime", live.getStartTime());
        return map;
    }

    private Map<String, Object> buildVodAssetMap(VodAsset vod) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", vod.getId());
        map.put("type", "VOD");
        map.put("title", vod.getTitle());
        map.put("vodUrl", vod.getVodUrl());
        map.put("thumbnailUrl", vod.getThumbnailUrl());
        map.put("duration", vod.getDuration());
        map.put("viewCount", vod.getViewCount());
        map.put("encodingStatus", vod.getEncodingStatus().name());
        return map;
    }

    private Map<String, Object> buildClipAssetMap(ClipAsset clip) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", clip.getId());
        map.put("type", "CLIP");
        map.put("title", clip.getTitle());
        map.put("clipUrl", clip.getClipUrl());
        map.put("thumbnailUrl", clip.getThumbnailUrl());
        map.put("duration", clip.getDuration());
        map.put("startTimeSec", clip.getStartTimeSec());
        map.put("endTimeSec", clip.getEndTimeSec());
        map.put("viewCount", clip.getViewCount());
        return map;
    }
}
