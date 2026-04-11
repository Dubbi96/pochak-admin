package com.pochak.content.asset.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.asset.dto.BulkVisibilityRequest;
import com.pochak.content.asset.dto.clip.*;
import com.pochak.content.asset.entity.AssetTag;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.repository.AssetTagRepository;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClipAssetService {

    private final ClipAssetRepository clipAssetRepository;
    private final MatchRepository matchRepository;
    private final AssetTagRepository assetTagRepository;

    public Page<ClipAssetListResponse> list(
            ClipAsset.SourceType sourceType,
            LiveAsset.Visibility visibility,
            Long matchId,
            Long creatorUserId,
            Boolean isDisplayed,
            Pageable pageable) {

        Page<ClipAsset> page = clipAssetRepository.findWithFilters(
                sourceType, visibility, matchId, creatorUserId, isDisplayed, pageable);
        return page.map(ClipAssetListResponse::from);
    }

    public ClipAssetDetailResponse getDetail(Long id) {
        ClipAsset entity = findActiveOrThrow(id);
        return ClipAssetDetailResponse.from(entity);
    }

    @Transactional
    public ClipAssetDetailResponse create(CreateClipAssetRequest request) {
        Match match = null;
        if (request.getMatchId() != null) {
            match = matchRepository.findById(request.getMatchId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Match not found: " + request.getMatchId()));
        }

        ClipAsset entity = ClipAsset.builder()
                .sourceType(request.getSourceType())
                .sourceId(request.getSourceId())
                .match(match)
                .creatorUserId(request.getCreatorUserId())
                .title(request.getTitle())
                .startTimeSec(request.getStartTimeSec())
                .endTimeSec(request.getEndTimeSec())
                .visibility(request.getVisibility() != null ? request.getVisibility() : LiveAsset.Visibility.PUBLIC)
                .visibleTeamId(request.getVisibleTeamId())
                .build();

        ClipAsset saved = clipAssetRepository.save(entity);
        return ClipAssetDetailResponse.from(saved);
    }

    @Transactional
    public ClipAssetDetailResponse update(Long id, UpdateClipAssetRequest request) {
        ClipAsset entity = findActiveOrThrow(id);
        entity.update(
                request.getTitle() != null ? request.getTitle() : entity.getTitle(),
                request.getVisibility() != null ? request.getVisibility() : entity.getVisibility(),
                request.getVisibleTeamId(),
                request.getStartTimeSec() != null ? request.getStartTimeSec() : entity.getStartTimeSec(),
                request.getEndTimeSec() != null ? request.getEndTimeSec() : entity.getEndTimeSec()
        );
        return ClipAssetDetailResponse.from(entity);
    }

    @Transactional
    public void bulkUpdateVisibility(BulkVisibilityRequest request) {
        List<ClipAsset> entities = clipAssetRepository.findAllById(request.getIds());
        for (ClipAsset entity : entities) {
            entity.updateIsDisplayed(request.getIsDisplayed());
        }
    }

    @Transactional
    public void delete(Long id) {
        ClipAsset entity = findActiveOrThrow(id);
        entity.softDelete();
    }

    public List<ClipAssetListResponse> search(String keyword, Pageable pageable) {
        return clipAssetRepository.searchByTitle(keyword, pageable).stream()
                .map(ClipAssetListResponse::from)
                .toList();
    }

    @Transactional
    public ClipAssetDetailResponse createFromRange(CreateClipFromRangeRequest request, Long creatorUserId) {
        if (request.getStartTimeSeconds() >= request.getEndTimeSeconds()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "startTimeSeconds must be less than endTimeSeconds");
        }

        int duration = request.getEndTimeSeconds() - request.getStartTimeSeconds();
        ClipAsset.AspectRatio aspectRatio = request.getAspectRatio() != null
                ? ClipAsset.AspectRatio.valueOf(request.getAspectRatio().name())
                : ClipAsset.AspectRatio.RATIO_16_9;
        long effectiveCreatorUserId = creatorUserId != null ? creatorUserId : 0L;

        ClipAsset entity = ClipAsset.builder()
                .sourceType(request.getSourceContentType())
                .sourceId(request.getSourceContentId())
                .creatorUserId(effectiveCreatorUserId)
                .title(request.getTitle())
                .startTimeSec(request.getStartTimeSeconds())
                .endTimeSec(request.getEndTimeSeconds())
                .duration(duration)
                .aspectRatio(aspectRatio)
                .visibility(LiveAsset.Visibility.PUBLIC)
                .build();

        ClipAsset saved = clipAssetRepository.save(entity);

        // Create tags for the clip if provided
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            for (String tagName : request.getTags()) {
                AssetTag tag = AssetTag.builder()
                        .assetType("CLIP")
                        .assetId(saved.getId())
                        .tagName(tagName)
                        .build();
                assetTagRepository.save(tag);
            }
        }

        return ClipAssetDetailResponse.from(saved);
    }

    private ClipAsset findActiveOrThrow(Long id) {
        return clipAssetRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "ClipAsset not found: " + id));
    }
}
