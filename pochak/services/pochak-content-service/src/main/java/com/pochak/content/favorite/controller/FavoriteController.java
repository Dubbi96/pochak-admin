package com.pochak.content.favorite.controller;

import com.pochak.common.constant.HeaderConstants;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.favorite.dto.AddFavoriteRequest;
import com.pochak.content.favorite.dto.FavoriteResponse;
import com.pochak.content.favorite.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users/me/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ApiResponse<List<FavoriteResponse>> getFavorites(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<FavoriteResponse> page = favoriteService.getFavorites(userId, pageable);
        return ApiResponse.success(page.getContent(), toPageMeta(page));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FavoriteResponse> addFavorite(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @Valid @RequestBody AddFavoriteRequest request) {

        return ApiResponse.success(favoriteService.addFavorite(userId, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> removeFavorite(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long id) {

        favoriteService.removeFavorite(userId, id);
        return ApiResponse.success(null);
    }

    private <T> PageMeta toPageMeta(Page<T> page) {
        return PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
