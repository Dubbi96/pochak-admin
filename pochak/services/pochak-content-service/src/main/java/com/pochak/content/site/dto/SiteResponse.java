package com.pochak.content.site.dto;

import com.pochak.content.site.entity.OrganizationSite;
import com.pochak.content.site.entity.OrganizationSitePage;
import com.pochak.content.site.entity.OrganizationSiteSection;
import com.pochak.content.site.entity.OrganizationSiteTheme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class SiteResponse {

    private Long id;
    private String ownerType;
    private Long ownerId;
    private String title;
    private String description;
    private Boolean published;
    private ThemeDto theme;
    private List<PageDto> pages;

    public static SiteResponse from(OrganizationSite site) {
        return SiteResponse.builder()
                .id(site.getId())
                .ownerType(site.getOwnerType())
                .ownerId(site.getOwnerId())
                .title(site.getTitle())
                .description(site.getDescription())
                .published(site.getPublished())
                .theme(site.getTheme() != null ? ThemeDto.from(site.getTheme()) : null)
                .pages(site.getPages().stream().map(PageDto::from).toList())
                .build();
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ThemeDto {
        private String primaryColor;
        private String secondaryColor;
        private String fontFamily;
        private String logoUrl;
        private String bannerUrl;

        public static ThemeDto from(OrganizationSiteTheme theme) {
            return ThemeDto.builder()
                    .primaryColor(theme.getPrimaryColor())
                    .secondaryColor(theme.getSecondaryColor())
                    .fontFamily(theme.getFontFamily())
                    .logoUrl(theme.getLogoUrl())
                    .bannerUrl(theme.getBannerUrl())
                    .build();
        }
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PageDto {
        private Long id;
        private String pageKey;
        private String title;
        private Integer displayOrder;
        private List<SectionDto> sections;

        public static PageDto from(OrganizationSitePage page) {
            return PageDto.builder()
                    .id(page.getId())
                    .pageKey(page.getPageKey())
                    .title(page.getTitle())
                    .displayOrder(page.getDisplayOrder())
                    .sections(page.getSections().stream()
                            .filter(s -> Boolean.TRUE.equals(s.getActive()))
                            .map(SectionDto::from)
                            .toList())
                    .build();
        }
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class SectionDto {
        private Long id;
        private String sectionType;
        private String title;
        private Object contentJson;
        private Integer displayOrder;

        public static SectionDto from(OrganizationSiteSection section) {
            return SectionDto.builder()
                    .id(section.getId())
                    .sectionType(section.getSectionType())
                    .title(section.getTitle())
                    .contentJson(section.getContentJson())
                    .displayOrder(section.getDisplayOrder())
                    .build();
        }
    }
}
