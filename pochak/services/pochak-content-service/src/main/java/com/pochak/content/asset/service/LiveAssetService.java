package com.pochak.content.asset.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.asset.dto.BulkVisibilityRequest;
import com.pochak.content.asset.dto.live.*;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LiveAssetService {

    private final LiveAssetRepository liveAssetRepository;
    private final MatchRepository matchRepository;

    public Page<LiveAssetListResponse> list(
            LiveAsset.OwnerType ownerType,
            Long venueId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Boolean isDisplayed,
            LiveAsset.Visibility visibility,
            Pageable pageable) {

        Page<LiveAsset> page = liveAssetRepository.findWithFilters(
                ownerType, venueId, dateFrom, dateTo, isDisplayed, visibility, pageable);
        return page.map(LiveAssetListResponse::from);
    }

    public LiveAssetDetailResponse getDetail(Long id) {
        LiveAsset entity = findActiveOrThrow(id);
        return LiveAssetDetailResponse.from(entity);
    }

    @Transactional
    public LiveAssetDetailResponse create(CreateLiveAssetRequest request) {
        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Match not found: " + request.getMatchId()));

        LiveAsset entity = LiveAsset.builder()
                .match(match)
                .cameraId(request.getCameraId())
                .streamUrl(request.getStreamUrl())
                .panoramaUrl(request.getPanoramaUrl())
                .hdUrl(request.getHdUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .startTime(request.getStartTime())
                .visibility(request.getVisibility() != null ? request.getVisibility() : LiveAsset.Visibility.PUBLIC)
                .ownerType(request.getOwnerType())
                .ownerId(request.getOwnerId())
                .pixellotEventId(request.getPixellotEventId())
                .build();

        LiveAsset saved = liveAssetRepository.save(entity);
        return LiveAssetDetailResponse.from(saved);
    }

    @Transactional
    public LiveAssetDetailResponse update(Long id, UpdateLiveAssetRequest request) {
        LiveAsset entity = findActiveOrThrow(id);
        entity.update(
                request.getCameraId(),
                request.getStreamUrl(),
                request.getPanoramaUrl(),
                request.getHdUrl(),
                request.getThumbnailUrl(),
                request.getVisibility() != null ? request.getVisibility() : entity.getVisibility(),
                request.getStartTime()
        );
        return LiveAssetDetailResponse.from(entity);
    }

    @Transactional
    public void bulkUpdateVisibility(BulkVisibilityRequest request) {
        List<LiveAsset> entities = liveAssetRepository.findAllById(request.getIds());
        for (LiveAsset entity : entities) {
            entity.updateIsDisplayed(request.getIsDisplayed());
        }
    }

    @Transactional
    public void delete(Long id) {
        LiveAsset entity = findActiveOrThrow(id);
        entity.softDelete();
    }

    private LiveAsset findActiveOrThrow(Long id) {
        return liveAssetRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "LiveAsset not found: " + id));
    }
}
