package com.pochak.content.asset.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.asset.dto.BulkVisibilityRequest;
import com.pochak.content.asset.dto.vod.*;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
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
public class VodAssetService {

    private final VodAssetRepository vodAssetRepository;
    private final MatchRepository matchRepository;
    private final LiveAssetRepository liveAssetRepository;

    public Page<VodAssetListResponse> list(
            LiveAsset.OwnerType ownerType,
            String venueId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Boolean isDisplayed,
            LiveAsset.Visibility visibility,
            Pageable pageable) {

        Page<VodAsset> page = vodAssetRepository.findWithFilters(
                ownerType, venueId, dateFrom, dateTo, isDisplayed, visibility, pageable);
        return page.map(VodAssetListResponse::from);
    }

    public VodAssetDetailResponse getDetail(Long id) {
        VodAsset entity = findActiveOrThrow(id);
        return VodAssetDetailResponse.from(entity);
    }

    @Transactional
    public VodAssetDetailResponse create(CreateVodAssetRequest request) {
        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Match not found: " + request.getMatchId()));

        LiveAsset liveAsset = null;
        if (request.getLiveAssetId() != null) {
            liveAsset = liveAssetRepository.findByIdAndDeletedAtIsNull(request.getLiveAssetId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "LiveAsset not found: " + request.getLiveAssetId()));
        }

        VodAsset entity = VodAsset.builder()
                .match(match)
                .liveAsset(liveAsset)
                .title(request.getTitle())
                .vodUrl(request.getVodUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .duration(request.getDuration())
                .visibility(request.getVisibility() != null ? request.getVisibility() : LiveAsset.Visibility.PUBLIC)
                .ownerType(request.getOwnerType())
                .ownerId(request.getOwnerId())
                .build();

        VodAsset saved = vodAssetRepository.save(entity);
        return VodAssetDetailResponse.from(saved);
    }

    @Transactional
    public VodAssetDetailResponse update(Long id, UpdateVodAssetRequest request) {
        VodAsset entity = findActiveOrThrow(id);
        entity.update(
                request.getTitle() != null ? request.getTitle() : entity.getTitle(),
                request.getVodUrl() != null ? request.getVodUrl() : entity.getVodUrl(),
                request.getThumbnailUrl() != null ? request.getThumbnailUrl() : entity.getThumbnailUrl(),
                request.getDuration() != null ? request.getDuration() : entity.getDuration(),
                request.getVisibility() != null ? request.getVisibility() : entity.getVisibility()
        );
        return VodAssetDetailResponse.from(entity);
    }

    @Transactional
    public void bulkUpdateVisibility(BulkVisibilityRequest request) {
        List<VodAsset> entities = vodAssetRepository.findAllById(request.getIds());
        for (VodAsset entity : entities) {
            entity.updateIsDisplayed(request.getIsDisplayed());
        }
    }

    @Transactional
    public void delete(Long id) {
        VodAsset entity = findActiveOrThrow(id);
        entity.softDelete();
    }

    public List<VodAssetListResponse> search(String keyword, Pageable pageable) {
        return vodAssetRepository.searchByTitle(keyword, pageable).stream()
                .map(VodAssetListResponse::from)
                .toList();
    }

    private VodAsset findActiveOrThrow(Long id) {
        return vodAssetRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "VodAsset not found: " + id));
    }
}
