package com.pochak.content.like.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.like.dto.LikeCountResponse;
import com.pochak.content.like.entity.ContentLike;
import com.pochak.content.like.repository.ContentLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentLikeService {

    private final ContentLikeRepository contentLikeRepository;

    @Transactional
    public void toggleLike(Long userId, String contentType, Long contentId) {
        contentLikeRepository.findByUserIdAndContentTypeAndContentId(userId, contentType, contentId)
                .ifPresentOrElse(
                        existing -> contentLikeRepository.delete(existing),
                        () -> {
                            ContentLike like = ContentLike.builder()
                                    .userId(userId)
                                    .contentType(contentType)
                                    .contentId(contentId)
                                    .build();
                            contentLikeRepository.save(like);
                        }
                );
    }

    @Transactional
    public void removeLike(Long userId, String contentType, Long contentId) {
        ContentLike like = contentLikeRepository
                .findByUserIdAndContentTypeAndContentId(userId, contentType, contentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Like not found"));
        contentLikeRepository.delete(like);
    }

    public LikeCountResponse getLikeCount(Long userId, String contentType, Long contentId) {
        long count = contentLikeRepository.countByContentTypeAndContentId(contentType, contentId);
        boolean isLiked = contentLikeRepository.existsByUserIdAndContentTypeAndContentId(userId, contentType, contentId);

        return LikeCountResponse.builder()
                .contentType(contentType)
                .contentId(contentId)
                .likeCount(count)
                .isLiked(isLiked)
                .build();
    }
}
