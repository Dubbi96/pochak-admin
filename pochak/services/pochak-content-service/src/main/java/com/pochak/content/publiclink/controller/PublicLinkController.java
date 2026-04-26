package com.pochak.content.publiclink.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.publiclink.dto.CreatePublicLinkRequest;
import com.pochak.content.publiclink.dto.PublicResolveResponse;
import com.pochak.content.publiclink.dto.SlugCheckResponse;
import com.pochak.content.publiclink.service.PublicLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicLinkController {

    private final PublicLinkService publicLinkService;

    @GetMapping("/resolve/{slug}")
    public ApiResponse<PublicResolveResponse> resolve(@PathVariable String slug) {
        return ApiResponse.success(publicLinkService.resolve(slug));
    }

    @GetMapping("/slug/check")
    public ApiResponse<SlugCheckResponse> checkSlug(@RequestParam String slug) {
        return ApiResponse.success(publicLinkService.checkAvailability(slug));
    }

    @PostMapping("/links")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PublicResolveResponse> createLink(@Valid @RequestBody CreatePublicLinkRequest request) {
        return ApiResponse.success(publicLinkService.createLink(request));
    }
}
