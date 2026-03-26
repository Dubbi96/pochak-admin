package com.pochak.content.upload.service;

import com.pochak.content.upload.dto.*;

/**
 * VOD Upload & Processing Service.
 *
 * Flow: File Upload -> Storage -> Transcoding -> Multi-bitrate HLS -> CDN
 * Also: Live Stream -> Auto-record -> VOD conversion (after stream ends)
 *
 * Current: Stub returning mock URLs.
 * TODO: Replace with real object storage (S3/GCS) + transcoding (FFmpeg/AWS MediaConvert).
 */
public interface VodUploadService {

    /** Get presigned upload URL (for direct client upload to storage) */
    UploadTicket createUploadTicket(CreateUploadRequest request);

    /** Confirm upload complete, start transcoding */
    VodProcessingJob confirmUpload(Long ticketId);

    /** Convert a completed live stream to VOD */
    VodProcessingJob convertLiveToVod(LiveToVodRequest request);

    /** Get processing job status */
    VodProcessingJob getProcessingStatus(Long jobId);

    /** Get final playback URLs for a processed VOD */
    VodPlaybackInfo getVodPlaybackInfo(Long vodAssetId);
}
