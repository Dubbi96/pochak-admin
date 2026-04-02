package com.pochak.content.asset.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.asset.dto.tag.AssetTagResponse;
import com.pochak.content.asset.dto.tag.CreateAssetTagRequest;
import com.pochak.content.asset.service.AssetTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contents/tags")
@RequiredArgsConstructor
public class TagController {

    private final AssetTagService assetTagService;

    @GetMapping
    public ApiResponse<List<AssetTagResponse>> listTags(
            @RequestParam String assetType,
            @RequestParam Long assetId) {
        return ApiResponse.success(assetTagService.listTags(assetType, assetId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssetTagResponse> createTag(@Valid @RequestBody CreateAssetTagRequest request) {
        return ApiResponse.success(assetTagService.create(request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteTag(@PathVariable Long id) {
        assetTagService.delete(id);
        return ApiResponse.success(null);
    }
}
