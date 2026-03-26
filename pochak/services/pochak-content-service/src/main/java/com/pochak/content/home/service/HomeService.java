package com.pochak.content.home.service;

import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.display.entity.DisplaySection;
import com.pochak.content.display.repository.DisplaySectionRepository;
import com.pochak.content.home.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {

    private static final int SECTION_ITEM_LIMIT = 10;

    private final LiveAssetRepository liveAssetRepository;
    private final VodAssetRepository vodAssetRepository;
    private final ClipAssetRepository clipAssetRepository;
    private final CompetitionRepository competitionRepository;
    private final DisplaySectionRepository displaySectionRepository;

    @Cacheable(value = "home", key = "'main'", unless = "#result == null")
    public HomeResponse getHome() {
        // 1. Main banners from display_sections (BANNER type for HOME page)
        List<DisplaySection> bannerSections = displaySectionRepository
                .findByActiveTrueAndTargetPageOrderByDisplayOrderAsc("HOME");
        List<BannerItem> mainBanners = bannerSections.stream()
                .filter(s -> "BANNER".equals(s.getSectionType()))
                .map(BannerItem::fromDisplaySection)
                .toList();

        // 2. Live contents - currently broadcasting (single query with fetch joins)
        List<LiveAsset> broadcasting = liveAssetRepository
                .findByStatusWithMatchDetails(LiveAsset.LiveStatus.BROADCASTING);
        List<ContentCard> liveContents = broadcasting.stream()
                .map(ContentCard::fromLive)
                .toList();

        // 3. Competition banners - active competitions
        List<Competition> activeCompetitions = competitionRepository.findAllActiveDisplayed();
        List<CompetitionBanner> competitionBanners = activeCompetitions.stream()
                .map(CompetitionBanner::from)
                .toList();

        // 4. Content sections from display_sections config
        List<DisplaySection> contentSectionConfigs = bannerSections.stream()
                .filter(s -> !"BANNER".equals(s.getSectionType()))
                .toList();

        List<ContentSection> contentSections = buildContentSections(contentSectionConfigs);

        // Add default sections if no display_sections configured
        if (contentSections.isEmpty()) {
            contentSections = buildDefaultSections();
        }

        return HomeResponse.builder()
                .mainBanners(mainBanners)
                .liveContents(liveContents)
                .competitionBanners(competitionBanners)
                .contentSections(contentSections)
                .build();
    }

    private List<ContentSection> buildContentSections(List<DisplaySection> configs) {
        List<ContentSection> sections = new ArrayList<>();
        PageRequest limit = PageRequest.of(0, SECTION_ITEM_LIMIT);

        for (DisplaySection config : configs) {
            List<ContentCard> items = switch (config.getSectionType()) {
                case "POPULAR_CLIP" -> clipAssetRepository.findPopularClips(limit).stream()
                        .map(ContentCard::fromClip).toList();
                case "RECENT_CLIP" -> clipAssetRepository.findRecentClips(limit).stream()
                        .map(ContentCard::fromClip).toList();
                case "POPULAR_VOD" -> vodAssetRepository.findPopularVods(limit).stream()
                        .map(ContentCard::fromVod).toList();
                case "RECENT_VOD" -> vodAssetRepository.findRecentVods(limit).stream()
                        .map(ContentCard::fromVod).toList();
                default -> List.of();
            };

            sections.add(ContentSection.builder()
                    .sectionId(config.getId())
                    .title(config.getTitle())
                    .type(config.getSectionType())
                    .items(items)
                    .build());
        }

        return sections;
    }

    private List<ContentSection> buildDefaultSections() {
        List<ContentSection> sections = new ArrayList<>();
        PageRequest limit = PageRequest.of(0, SECTION_ITEM_LIMIT);

        // Popular clips
        List<ContentCard> popularClips = clipAssetRepository.findPopularClips(limit).stream()
                .map(ContentCard::fromClip).toList();
        sections.add(ContentSection.builder()
                .title("인기 클립")
                .type("POPULAR_CLIP")
                .items(popularClips)
                .build());

        // Recent VODs
        List<ContentCard> recentVods = vodAssetRepository.findRecentVods(limit).stream()
                .map(ContentCard::fromVod).toList();
        sections.add(ContentSection.builder()
                .title("최신 VOD")
                .type("RECENT_VOD")
                .items(recentVods)
                .build());

        // Popular VODs
        List<ContentCard> popularVods = vodAssetRepository.findPopularVods(limit).stream()
                .map(ContentCard::fromVod).toList();
        sections.add(ContentSection.builder()
                .title("인기 VOD")
                .type("POPULAR_VOD")
                .items(popularVods)
                .build());

        return sections;
    }
}
