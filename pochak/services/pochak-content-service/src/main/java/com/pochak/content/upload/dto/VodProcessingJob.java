package com.pochak.content.upload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VodProcessingJob {

    private Long id;
    private Long vodAssetId;         // linked VodAsset once created
    private String status;           // QUEUED, TRANSCODING, THUMBNAIL_GENERATING, COMPLETED, FAILED
    private Integer progressPercent; // 0-100
    private String sourceUrl;        // original file URL
    private String outputHlsUrl;     // transcoded HLS URL
    private List<QualityLevel> outputProfiles;
    private String thumbnailUrl;     // auto-generated thumbnail
    private Long durationSeconds;    // detected duration
    private String errorMessage;     // if FAILED
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
