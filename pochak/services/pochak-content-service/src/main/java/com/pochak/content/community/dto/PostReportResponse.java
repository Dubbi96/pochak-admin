package com.pochak.content.community.dto;

import com.pochak.content.community.entity.ModerationStatus;
import com.pochak.content.community.entity.PostReport;
import com.pochak.content.community.entity.ReportCategory;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostReportResponse {

    private Long id;
    private Long postId;
    private Long reporterUserId;
    private ReportCategory category;
    private String reason;
    private ModerationStatus status;
    private Long resolvedByUserId;
    private String resolutionNote;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public static PostReportResponse from(PostReport report) {
        return PostReportResponse.builder()
                .id(report.getId())
                .postId(report.getPostId())
                .reporterUserId(report.getReporterUserId())
                .category(report.getCategory())
                .reason(report.getReason())
                .status(report.getStatus())
                .resolvedByUserId(report.getResolvedByUserId())
                .resolutionNote(report.getResolutionNote())
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .build();
    }
}
