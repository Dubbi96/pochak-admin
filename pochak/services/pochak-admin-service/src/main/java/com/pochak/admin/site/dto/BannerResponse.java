package com.pochak.admin.site.dto;

import com.pochak.admin.site.entity.Banner;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
public class BannerResponse {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private Long id;
    private Integer order;
    private String title;
    private String pcImageUrl;
    private String mobileImageUrl;
    private String linkUrl;
    private String startDate;
    private String endDate;
    private String status;
    private String createdAt;

    public static BannerResponse from(Banner b) {
        return BannerResponse.builder()
                .id(b.getId())
                .order(b.getSortOrder() != null ? b.getSortOrder() : 0)
                .title(b.getTitle())
                .pcImageUrl(b.getPcImageUrl() != null ? b.getPcImageUrl() : "")
                .mobileImageUrl(b.getMobileImageUrl() != null ? b.getMobileImageUrl() : "")
                .linkUrl(b.getLinkUrl() != null ? b.getLinkUrl() : "")
                .startDate(b.getStartDate() != null ? b.getStartDate().format(DATE_FMT) : "")
                .endDate(b.getEndDate() != null ? b.getEndDate().format(DATE_FMT) : "")
                .status(Boolean.TRUE.equals(b.getIsActive()) ? "PUBLISHED" : "UNPUBLISHED")
                .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().format(DATETIME_FMT) : "")
                .build();
    }
}
