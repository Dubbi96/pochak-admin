package com.pochak.content.highlight.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.highlight.dto.AiClipResponse;
import com.pochak.content.highlight.dto.CreateHighlightRequest;
import com.pochak.content.highlight.dto.HighlightResponse;
import com.pochak.content.highlight.service.AutoClipGeneratorService;
import com.pochak.content.highlight.service.HighlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contents/{type}/{id}/highlights")
@RequiredArgsConstructor
public class HighlightController {

    private final HighlightService highlightService;
    private final AutoClipGeneratorService autoClipGeneratorService;
    private final ClipAssetRepository clipAssetRepository;

    /**
     * List highlights for a content item, sorted by start time.
     */
    @GetMapping
    public ApiResponse<List<HighlightResponse>> getHighlights(
            @PathVariable("type") String type,
            @PathVariable("id") Long id) {

        return ApiResponse.success(highlightService.getHighlights(id, type));
    }

    /**
     * Trigger auto-detection of highlights (stub).
     * Also generates clips from the detected highlights.
     */
    @PostMapping("/detect")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Map<String, Object>> detectHighlights(
            @PathVariable("type") String type,
            @PathVariable("id") Long id) {

        List<HighlightResponse> highlights = highlightService.detectHighlights(id, type);
        List<Long> clipIds = autoClipGeneratorService.generateClipsFromHighlights(id, type);

        return ApiResponse.success(Map.of(
                "highlights", highlights,
                "generatedClipIds", clipIds
        ));
    }

    /**
     * List AI-generated clips for a content item, sorted by start time.
     */
    @GetMapping("/ai-clips")
    public ApiResponse<List<AiClipResponse>> getAiClips(
            @PathVariable("type") String type,
            @PathVariable("id") Long id) {

        ClipAsset.SourceType sourceType = "live".equalsIgnoreCase(type)
                ? ClipAsset.SourceType.LIVE
                : ClipAsset.SourceType.VOD;

        List<AiClipResponse> clips = clipAssetRepository
                .findBySourceTypeAndSourceId(sourceType, id)
                .stream()
                .map(AiClipResponse::from)
                .toList();

        return ApiResponse.success(clips);
    }

    /**
     * Manually create a highlight for a content item.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<HighlightResponse> createManualHighlight(
            @PathVariable("type") String type,
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateHighlightRequest request) {

        return ApiResponse.success(highlightService.createManualHighlight(id, type, request));
    }
}
