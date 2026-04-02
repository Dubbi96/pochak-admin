package com.pochak.content.asset.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.asset.dto.tag.AssetTagResponse;
import com.pochak.content.asset.dto.tag.CreateAssetTagRequest;
import com.pochak.content.asset.entity.AssetTag;
import com.pochak.content.asset.repository.AssetTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssetTagService {

    private final AssetTagRepository assetTagRepository;

    public List<AssetTagResponse> listTags(String assetType, Long assetId) {
        if (assetType == null || assetId == null) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "assetType and assetId are required");
        }

        List<AssetTag> tags = assetTagRepository
                .findByAssetTypeAndAssetIdAndDeletedAtIsNullOrderByTagTimeSecAsc(assetType, assetId);
        return tags.stream().map(AssetTagResponse::from).toList();
    }

    @Transactional
    public AssetTagResponse create(CreateAssetTagRequest request) {
        AssetTag entity = AssetTag.builder()
                .sportTagId(request.getSportTagId())
                .assetType(request.getAssetType())
                .assetId(request.getAssetId())
                .taggerUserId(request.getTaggerUserId())
                .tagTimeSec(request.getTagTimeSec())
                .tagName(request.getTagName())
                .teamId(request.getTeamId())
                .uniformNumber(request.getUniformNumber())
                .build();

        AssetTag saved = assetTagRepository.save(entity);
        return AssetTagResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        AssetTag tag = assetTagRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "AssetTag not found: " + id));
        assetTagRepository.delete(tag);
    }
}
