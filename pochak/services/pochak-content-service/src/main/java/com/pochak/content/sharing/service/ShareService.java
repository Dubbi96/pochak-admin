package com.pochak.content.sharing.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.sharing.dto.CreateShareRequest;
import com.pochak.content.sharing.dto.ShareInfoResponse;
import com.pochak.content.sharing.dto.ShareResponse;
import com.pochak.content.sharing.entity.Share;
import com.pochak.content.sharing.repository.ShareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShareService {

    private final ShareRepository shareRepository;
    private final VodAssetRepository vodAssetRepository;

    @Transactional
    public ShareResponse createShare(Long userId, Long contentId, CreateShareRequest request) {
        Share share = Share.builder()
                .contentId(contentId)
                .contentType(request.getContentType())
                .userId(userId)
                .platform(request.getPlatform())
                .build();

        Share saved = shareRepository.save(share);
        log.info("Share event recorded: contentId={}, contentType={}, platform={}, userId={}",
                contentId, request.getContentType(), request.getPlatform(), userId);

        return ShareResponse.from(saved);
    }

    public ShareInfoResponse getShareInfo(Long contentId, String contentType) {
        long shareCount = shareRepository.countByContentTypeAndContentId(contentType, contentId);

        String title = "";
        String description = "";
        String thumbnailUrl = "";

        if ("VOD".equalsIgnoreCase(contentType)) {
            VodAsset vod = vodAssetRepository.findByIdAndDeletedAtIsNull(contentId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                            "Content not found: " + contentType + "/" + contentId));
            title = vod.getTitle();
            thumbnailUrl = vod.getThumbnailUrl();
            description = vod.getTitle();
        } else {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Unsupported content type for share info: " + contentType);
        }

        return ShareInfoResponse.builder()
                .contentId(contentId)
                .contentType(contentType)
                .title(title)
                .description(description)
                .thumbnailUrl(thumbnailUrl)
                .shareCount(shareCount)
                .build();
    }
}
