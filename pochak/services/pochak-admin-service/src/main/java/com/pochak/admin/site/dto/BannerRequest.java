package com.pochak.admin.site.dto;

import com.pochak.admin.site.entity.Banner;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class BannerRequest {

    private String title;
    private String pcImageUrl;
    private String mobileImageUrl;
    private String linkUrl;
    private String startDate;
    private String endDate;
    private String status;  // PUBLISHED | UNPUBLISHED
    private Integer order;

    public Banner toEntity() {
        return Banner.builder()
                .title(title)
                .pcImageUrl(pcImageUrl != null ? pcImageUrl : "")
                .mobileImageUrl(mobileImageUrl != null ? mobileImageUrl : "")
                .linkUrl(linkUrl != null ? linkUrl : "")
                .sortOrder(order != null ? order : 0)
                .startDate(startDate != null ? LocalDate.parse(startDate).atStartOfDay() : LocalDateTime.now())
                .endDate(endDate != null ? LocalDate.parse(endDate).atStartOfDay() : LocalDateTime.now().plusDays(30))
                .isActive("PUBLISHED".equals(status))
                .build();
    }
}
