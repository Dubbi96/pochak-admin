package com.pochak.content.livestream.dto;

import com.pochak.content.livestream.entity.LiveStream;
import com.pochak.content.livestream.entity.LiveStream.StreamStatus;
import com.pochak.content.livestream.entity.LiveStream.StreamVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class LiveStreamResponse {

    private Long id;
    private String title;
    private String description;
    private Long streamerUserId;
    private Long matchId;
    private String streamKey;
    private String streamUrl;
    private String thumbnailUrl;
    private StreamStatus status;
    private StreamVisibility visibility;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer peakViewerCount;
    private Long totalViewCount;
    private Integer currentViewerCount;
    private LocalDateTime createdAt;

    public static LiveStreamResponse from(LiveStream stream) {
        return from(stream, 0);
    }

    public static LiveStreamResponse from(LiveStream stream, int currentViewerCount) {
        return LiveStreamResponse.builder()
                .id(stream.getId())
                .title(stream.getTitle())
                .description(stream.getDescription())
                .streamerUserId(stream.getStreamerUserId())
                .matchId(stream.getMatch() != null ? stream.getMatch().getId() : null)
                .streamKey(stream.getStreamKey())
                .streamUrl(stream.getStreamUrl())
                .thumbnailUrl(stream.getThumbnailUrl())
                .status(stream.getStatus())
                .visibility(stream.getVisibility())
                .scheduledAt(stream.getScheduledAt())
                .startedAt(stream.getStartedAt())
                .endedAt(stream.getEndedAt())
                .peakViewerCount(stream.getPeakViewerCount())
                .totalViewCount(stream.getTotalViewCount())
                .currentViewerCount(currentViewerCount)
                .createdAt(stream.getCreatedAt())
                .build();
    }
}
