package com.pochak.content.favorite.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.favorite.dto.AddFavoriteRequest;
import com.pochak.content.favorite.dto.FavoriteResponse;
import com.pochak.content.favorite.entity.Favorite;
import com.pochak.content.favorite.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    public Page<FavoriteResponse> getFavorites(Long userId, Pageable pageable) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(FavoriteResponse::from);
    }

    @Transactional
    public FavoriteResponse addFavorite(Long userId, AddFavoriteRequest request) {
        if (favoriteRepository.existsByUserIdAndTargetTypeAndTargetId(
                userId, request.getContentType(), request.getContentId())) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Already added to favorites");
        }

        Favorite entity = Favorite.builder()
                .userId(userId)
                .targetType(request.getContentType())
                .targetId(request.getContentId())
                .build();

        Favorite saved = favoriteRepository.save(entity);
        return FavoriteResponse.from(saved);
    }

    @Transactional
    public void removeFavorite(Long userId, Long favoriteId) {
        Favorite entity = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Favorite not found: " + favoriteId));

        if (!entity.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Cannot delete another user's favorite");
        }

        favoriteRepository.delete(entity);
    }
}
