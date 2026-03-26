package com.pochak.content.upload.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.upload.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Stub implementation of VodUploadService for development/testing.
 * Returns mock presigned URLs and simulates async transcoding progress.
 *
 * TODO: Replace with real implementation:
 *  - Object Storage: AWS S3 presigned URL / GCS signed URL
 *  - Transcoding: AWS MediaConvert / FFmpeg worker / GCP Transcoder API
 *  - Thumbnail: FFmpeg frame extraction
 *  - CDN delivery: CloudFront / Cloud CDN
 */
@Service
@Slf4j
public class StubVodUploadService implements VodUploadService {

    private static final String STORAGE_BASE_URL = "https://storage.pochak.co.kr/upload";
    private static final String CDN_BASE_URL = "https://cdn.pochak.co.kr/vod";
    private static final String THUMB_BASE_URL = "https://cdn.pochak.co.kr/thumbnails";

    private final ConcurrentHashMap<Long, UploadTicket> tickets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, VodProcessingJob> jobs = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, VodPlaybackInfo> playbackCache = new ConcurrentHashMap<>();
    private final AtomicLong ticketIdSeq = new AtomicLong(1);
    private final AtomicLong jobIdSeq = new AtomicLong(1);
    private final AtomicLong vodAssetIdSeq = new AtomicLong(1000);

    @Override
    public UploadTicket createUploadTicket(CreateUploadRequest request) {
        Long id = ticketIdSeq.getAndIncrement();
        String storageKey = "uploads/" + UUID.randomUUID() + "/" + request.getFilename();
        String presignedUrl = STORAGE_BASE_URL + "/" + storageKey + "?X-Signature=mock-sig-" + id;

        UploadTicket ticket = UploadTicket.builder()
                .id(id)
                .uploadUrl(presignedUrl)
                .storageKey(storageKey)
                .status("CREATED")
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        tickets.put(id, ticket);
        log.info("[STUB] Created upload ticket id={}, filename={}, size={}bytes",
                id, request.getFilename(), request.getFileSizeBytes());
        return ticket;
    }

    @Override
    public VodProcessingJob confirmUpload(Long ticketId) {
        UploadTicket ticket = tickets.get(ticketId);
        if (ticket == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Upload ticket not found: " + ticketId);
        }

        Long jobId = jobIdSeq.getAndIncrement();
        Long vodAssetId = vodAssetIdSeq.getAndIncrement();

        // Simulate a transcoding job that starts at QUEUED and progresses
        VodProcessingJob job = VodProcessingJob.builder()
                .id(jobId)
                .vodAssetId(vodAssetId)
                .status("TRANSCODING")
                .progressPercent(35)
                .sourceUrl(STORAGE_BASE_URL + "/" + ticket.getStorageKey())
                .outputHlsUrl(CDN_BASE_URL + "/" + vodAssetId + "/master.m3u8")
                .outputProfiles(defaultQualityLevels())
                .thumbnailUrl(THUMB_BASE_URL + "/" + vodAssetId + "/thumb_001.jpg")
                .durationSeconds(5400L) // simulated 90min
                .createdAt(LocalDateTime.now())
                .build();

        jobs.put(jobId, job);

        // Pre-populate playback info
        playbackCache.put(vodAssetId, VodPlaybackInfo.builder()
                .vodAssetId(vodAssetId)
                .hlsUrl(CDN_BASE_URL + "/" + vodAssetId + "/master.m3u8")
                .dashUrl(CDN_BASE_URL + "/" + vodAssetId + "/manifest.mpd")
                .mp4Url(CDN_BASE_URL + "/" + vodAssetId + "/progressive.mp4")
                .durationSeconds(5400L)
                .qualityLevels(defaultQualityLevels())
                .thumbnailUrl(THUMB_BASE_URL + "/" + vodAssetId + "/thumb_001.jpg")
                .previewThumbnails(List.of(
                        THUMB_BASE_URL + "/" + vodAssetId + "/preview_0010.jpg",
                        THUMB_BASE_URL + "/" + vodAssetId + "/preview_0020.jpg",
                        THUMB_BASE_URL + "/" + vodAssetId + "/preview_0030.jpg"
                ))
                .build());

        log.info("[STUB] Upload confirmed, transcoding job id={}, vodAssetId={}", jobId, vodAssetId);
        return job;
    }

    @Override
    public VodProcessingJob convertLiveToVod(LiveToVodRequest request) {
        Long jobId = jobIdSeq.getAndIncrement();
        Long vodAssetId = vodAssetIdSeq.getAndIncrement();

        VodProcessingJob job = VodProcessingJob.builder()
                .id(jobId)
                .vodAssetId(vodAssetId)
                .status("QUEUED")
                .progressPercent(0)
                .sourceUrl("https://cdn.pochak.co.kr/live/" + request.getTranscodeSessionId() + "/recording.ts")
                .outputHlsUrl(CDN_BASE_URL + "/" + vodAssetId + "/master.m3u8")
                .outputProfiles(defaultQualityLevels())
                .thumbnailUrl(THUMB_BASE_URL + "/" + vodAssetId + "/thumb_001.jpg")
                .durationSeconds(7200L) // simulated 2hr match
                .createdAt(LocalDateTime.now())
                .build();

        jobs.put(jobId, job);

        playbackCache.put(vodAssetId, VodPlaybackInfo.builder()
                .vodAssetId(vodAssetId)
                .hlsUrl(CDN_BASE_URL + "/" + vodAssetId + "/master.m3u8")
                .dashUrl(CDN_BASE_URL + "/" + vodAssetId + "/manifest.mpd")
                .mp4Url(CDN_BASE_URL + "/" + vodAssetId + "/progressive.mp4")
                .durationSeconds(7200L)
                .qualityLevels(defaultQualityLevels())
                .thumbnailUrl(THUMB_BASE_URL + "/" + vodAssetId + "/thumb_001.jpg")
                .previewThumbnails(List.of(
                        THUMB_BASE_URL + "/" + vodAssetId + "/preview_0010.jpg",
                        THUMB_BASE_URL + "/" + vodAssetId + "/preview_0020.jpg"
                ))
                .build());

        log.info("[STUB] Live-to-VOD conversion job id={}, transcodeSession={}, vodAssetId={}",
                jobId, request.getTranscodeSessionId(), vodAssetId);
        return job;
    }

    @Override
    public VodProcessingJob getProcessingStatus(Long jobId) {
        VodProcessingJob job = jobs.get(jobId);
        if (job == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Processing job not found: " + jobId);
        }

        // Simulate progress advancement on each poll
        simulateProgress(job);
        return job;
    }

    @Override
    public VodPlaybackInfo getVodPlaybackInfo(Long vodAssetId) {
        VodPlaybackInfo info = playbackCache.get(vodAssetId);
        if (info == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "VOD asset not found: " + vodAssetId);
        }
        return info;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void simulateProgress(VodProcessingJob job) {
        if ("COMPLETED".equals(job.getStatus()) || "FAILED".equals(job.getStatus())) {
            return;
        }

        int current = job.getProgressPercent() != null ? job.getProgressPercent() : 0;
        int next = Math.min(current + 15, 100);
        job.setProgressPercent(next);

        if (next < 70) {
            job.setStatus("TRANSCODING");
        } else if (next < 95) {
            job.setStatus("THUMBNAIL_GENERATING");
        } else {
            job.setStatus("COMPLETED");
            job.setProgressPercent(100);
            job.setCompletedAt(LocalDateTime.now());
        }
    }

    private List<QualityLevel> defaultQualityLevels() {
        return List.of(
                QualityLevel.builder().label("1080p").width(1920).height(1080).bitrate(4500).build(),
                QualityLevel.builder().label("720p").width(1280).height(720).bitrate(2500).build(),
                QualityLevel.builder().label("480p").width(854).height(480).bitrate(1200).build(),
                QualityLevel.builder().label("360p").width(640).height(360).bitrate(600).build()
        );
    }
}
