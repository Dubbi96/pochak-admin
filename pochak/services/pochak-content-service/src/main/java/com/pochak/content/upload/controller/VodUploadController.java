package com.pochak.content.upload.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.upload.dto.*;
import com.pochak.content.upload.service.VodUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class VodUploadController {

    private final VodUploadService vodUploadService;

    /** Get upload ticket (presigned URL for direct client upload) */
    @PostMapping("/ticket")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UploadTicket> createUploadTicket(
            @Valid @RequestBody CreateUploadRequest request) {
        return ApiResponse.success(vodUploadService.createUploadTicket(request));
    }

    /** Confirm upload complete, start transcoding pipeline */
    @PostMapping("/ticket/{id}/confirm")
    public ApiResponse<VodProcessingJob> confirmUpload(@PathVariable Long id) {
        return ApiResponse.success(vodUploadService.confirmUpload(id));
    }

    /** Get processing job status (poll for progress) */
    @GetMapping("/jobs/{id}")
    public ApiResponse<VodProcessingJob> getProcessingStatus(@PathVariable Long id) {
        return ApiResponse.success(vodUploadService.getProcessingStatus(id));
    }

    /** Convert a completed live stream recording to VOD */
    @PostMapping("/live-to-vod")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VodProcessingJob> convertLiveToVod(
            @Valid @RequestBody LiveToVodRequest request) {
        return ApiResponse.success(vodUploadService.convertLiveToVod(request));
    }

    /** Get final playback info for a processed VOD asset */
    @GetMapping("/vod/{vodAssetId}/playback")
    public ApiResponse<VodPlaybackInfo> getVodPlaybackInfo(@PathVariable Long vodAssetId) {
        return ApiResponse.success(vodUploadService.getVodPlaybackInfo(vodAssetId));
    }
}
