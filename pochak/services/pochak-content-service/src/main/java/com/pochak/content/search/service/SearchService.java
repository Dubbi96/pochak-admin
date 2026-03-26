package com.pochak.content.search.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.competition.repository.MatchRepository;
import com.pochak.content.organization.entity.Organization;
import com.pochak.content.organization.repository.OrganizationRepository;
import com.pochak.content.search.dto.*;
import com.pochak.content.team.entity.Team;
import com.pochak.content.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final TeamRepository teamRepository;
    private final OrganizationRepository organizationRepository;
    private final LiveAssetRepository liveAssetRepository;
    private final VodAssetRepository vodAssetRepository;
    private final ClipAssetRepository clipAssetRepository;
    private final CompetitionRepository competitionRepository;
    private final MatchRepository matchRepository;

    private static final int MAX_QUERY_LENGTH = 25;
    private static final int SECTION_LIMIT = 10;
    private static final int RECOMMENDATION_LIMIT = 10;
    private static final int SUGGEST_LIMIT = 5;
    private static final int TRENDING_LIMIT = 10;

    public UnifiedSearchResponse search(String query, Set<String> types) {
        if (query == null || query.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Search query must not be empty");
        }

        if (query.length() > MAX_QUERY_LENGTH) {
            query = query.substring(0, MAX_QUERY_LENGTH);
        }

        String keyword = query.trim();
        Pageable limit = PageRequest.of(0, SECTION_LIMIT);

        boolean searchAll = types == null || types.isEmpty();

        List<SearchSection> sections = new ArrayList<>();

        // 1. TEAM (horizontal)
        if (searchAll || types.contains("TEAM")) {
            List<Team> teams = teamRepository.searchByName(keyword, limit);
            if (!teams.isEmpty()) {
                sections.add(buildSection(SearchSection.SearchType.TEAM,
                        SearchSection.LayoutType.HORIZONTAL,
                        teams.stream().map(this::teamToItem).toList(),
                        teams.size()));
            }
        }

        // 2. CLUB (vertical) - organizations
        if (searchAll || types.contains("CLUB")) {
            List<Organization> orgs = organizationRepository.searchByName(keyword, limit);
            if (!orgs.isEmpty()) {
                sections.add(buildSection(SearchSection.SearchType.CLUB,
                        SearchSection.LayoutType.VERTICAL,
                        orgs.stream().map(this::orgToItem).toList(),
                        orgs.size()));
            }
        }

        // 3. LIVE (horizontal)
        if (searchAll || types.contains("LIVE")) {
            List<LiveAsset> lives = liveAssetRepository.searchByTitle(keyword, limit);
            if (!lives.isEmpty()) {
                sections.add(buildSection(SearchSection.SearchType.LIVE,
                        SearchSection.LayoutType.HORIZONTAL,
                        lives.stream().map(this::liveToItem).toList(),
                        lives.size()));
            }
        }

        // 4. SCHEDULE (horizontal) - matches
        if (searchAll || types.contains("SCHEDULE")) {
            List<Match> matches = matchRepository.searchByTitle(keyword, limit);
            if (!matches.isEmpty()) {
                sections.add(buildSection(SearchSection.SearchType.SCHEDULE,
                        SearchSection.LayoutType.HORIZONTAL,
                        matches.stream().map(this::matchToItem).toList(),
                        matches.size()));
            }
        }

        // 5. COMPETITION (vertical)
        if (searchAll || types.contains("COMPETITION")) {
            List<Competition> competitions = competitionRepository.searchByName(keyword, limit);
            if (!competitions.isEmpty()) {
                sections.add(buildSection(SearchSection.SearchType.COMPETITION,
                        SearchSection.LayoutType.VERTICAL,
                        competitions.stream().map(this::competitionToItem).toList(),
                        competitions.size()));
            }
        }

        // 6. VIDEO (vertical) - vods
        if (searchAll || types.contains("VIDEO")) {
            List<VodAsset> vods = vodAssetRepository.searchByTitle(keyword, limit);
            if (!vods.isEmpty()) {
                sections.add(buildSection(SearchSection.SearchType.VIDEO,
                        SearchSection.LayoutType.VERTICAL,
                        vods.stream().map(this::vodToItem).toList(),
                        vods.size()));
            }
        }

        // 7. CLIP (vertical)
        if (searchAll || types.contains("CLIP")) {
            List<ClipAsset> clips = clipAssetRepository.searchByTitle(keyword, limit);
            if (!clips.isEmpty()) {
                sections.add(buildSection(SearchSection.SearchType.CLIP,
                        SearchSection.LayoutType.VERTICAL,
                        clips.stream().map(this::clipToItem).toList(),
                        clips.size()));
            }
        }

        // If no results, add recommendations
        SearchRecommendations recommendations = null;
        if (sections.isEmpty()) {
            recommendations = buildRecommendations();
        }

        return UnifiedSearchResponse.builder()
                .query(keyword)
                .sections(sections)
                .recommendations(recommendations)
                .build();
    }

    public List<SearchSuggestion> getSuggestions(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        String keyword = query.trim();
        if (keyword.length() > MAX_QUERY_LENGTH) {
            keyword = keyword.substring(0, MAX_QUERY_LENGTH);
        }

        Pageable limit = PageRequest.of(0, SUGGEST_LIMIT);
        List<SearchSuggestion> suggestions = new ArrayList<>();

        // Search across content titles
        List<VodAsset> vods = vodAssetRepository.searchByTitle(keyword, limit);
        for (VodAsset vod : vods) {
            suggestions.add(SearchSuggestion.builder()
                    .text(vod.getTitle())
                    .type("VIDEO")
                    .id(vod.getId())
                    .build());
        }

        // Search across competition names
        List<Competition> competitions = competitionRepository.searchByName(keyword, limit);
        for (Competition comp : competitions) {
            suggestions.add(SearchSuggestion.builder()
                    .text(comp.getName())
                    .type("COMPETITION")
                    .id(comp.getId())
                    .build());
        }

        // Search across team names
        List<Team> teams = teamRepository.searchByName(keyword, limit);
        for (Team team : teams) {
            suggestions.add(SearchSuggestion.builder()
                    .text(team.getName())
                    .type("TEAM")
                    .id(team.getId())
                    .build());
        }

        // Deduplicate by text (case-insensitive) and limit to top 5
        Set<String> seen = new LinkedHashSet<>();
        return suggestions.stream()
                .filter(s -> seen.add(s.getText().toLowerCase()))
                .limit(SUGGEST_LIMIT)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "trending-search", unless = "#result == null")
    public TrendingSearchResponse getTrendingSearchTerms() {
        // Return curated trending search terms.
        // In production, this would be backed by a search analytics table or cache (e.g., Redis sorted set).
        // For now, we derive terms from popular content titles and competition names.
        Pageable limit = PageRequest.of(0, TRENDING_LIMIT);
        List<TrendingSearchResponse.TrendingTerm> terms = new ArrayList<>();

        int rank = 1;

        // Popular clips by view count
        try {
            List<ClipAsset> clips = clipAssetRepository.findPopularClips(PageRequest.of(0, 4));
            for (ClipAsset clip : clips) {
                terms.add(TrendingSearchResponse.TrendingTerm.builder()
                        .rank(rank++)
                        .keyword(clip.getTitle())
                        .changeDirection("STABLE")
                        .build());
            }
        } catch (Exception ignored) {
        }

        // Active competitions
        try {
            List<Competition> competitions = competitionRepository.findAllActiveDisplayed();
            for (Competition comp : competitions) {
                if (rank > TRENDING_LIMIT) break;
                terms.add(TrendingSearchResponse.TrendingTerm.builder()
                        .rank(rank++)
                        .keyword(comp.getName())
                        .changeDirection("UP")
                        .build());
            }
        } catch (Exception ignored) {
        }

        // Popular VODs
        try {
            List<VodAsset> vods = vodAssetRepository.findPopularVods(PageRequest.of(0, 3));
            for (VodAsset vod : vods) {
                if (rank > TRENDING_LIMIT) break;
                terms.add(TrendingSearchResponse.TrendingTerm.builder()
                        .rank(rank++)
                        .keyword(vod.getTitle())
                        .changeDirection("STABLE")
                        .build());
            }
        } catch (Exception ignored) {
        }

        // Ensure we don't exceed limit
        if (terms.size() > TRENDING_LIMIT) {
            terms = terms.subList(0, TRENDING_LIMIT);
        }

        return TrendingSearchResponse.builder()
                .terms(terms)
                .build();
    }

    private SearchRecommendations buildRecommendations() {
        Pageable limit = PageRequest.of(0, RECOMMENDATION_LIMIT);

        List<SearchItem> clipItems = new ArrayList<>();
        try {
            List<ClipAsset> clips = clipAssetRepository.findPopularClips(limit);
            clipItems = clips.stream().map(this::clipToItem).toList();
        } catch (Exception ignored) {
        }

        List<SearchItem> vodItems = new ArrayList<>();
        try {
            List<VodAsset> vods = vodAssetRepository.findPopularVods(limit);
            vodItems = vods.stream().map(this::vodToItem).toList();
        } catch (Exception ignored) {
        }

        return SearchRecommendations.builder()
                .clips(clipItems)
                .vods(vodItems)
                .build();
    }

    private SearchSection buildSection(SearchSection.SearchType type, SearchSection.LayoutType layout,
                                        List<SearchItem> items, long totalCount) {
        return SearchSection.builder()
                .type(type)
                .layout(layout)
                .items(items)
                .totalCount(totalCount)
                .build();
    }

    private SearchItem teamToItem(Team team) {
        return SearchItem.builder()
                .id(team.getId())
                .title(team.getName())
                .logoUrl(team.getLogoUrl())
                .description(team.getDescription())
                .createdAt(team.getCreatedAt())
                .extra(Map.of(
                        "sportId", team.getSport() != null ? team.getSport().getId() : 0L,
                        "shortName", team.getShortName() != null ? team.getShortName() : ""
                ))
                .build();
    }

    private SearchItem orgToItem(Organization org) {
        return SearchItem.builder()
                .id(org.getId())
                .title(org.getName())
                .logoUrl(org.getLogoUrl())
                .description(org.getDescription())
                .createdAt(org.getCreatedAt())
                .extra(Map.of("orgType", org.getOrgType().name()))
                .build();
    }

    private SearchItem liveToItem(LiveAsset live) {
        String title = live.getMatch() != null ? live.getMatch().getTitle() : "Live #" + live.getId();
        return SearchItem.builder()
                .id(live.getId())
                .title(title)
                .thumbnailUrl(live.getThumbnailUrl())
                .startTime(live.getStartTime())
                .createdAt(live.getCreatedAt())
                .extra(Map.of("status", live.getStatus().name()))
                .build();
    }

    private SearchItem matchToItem(Match match) {
        Map<String, Object> extra = new HashMap<>();
        extra.put("status", match.getStatus().name());
        if (match.getVenue() != null) {
            extra.put("venue", match.getVenue());
        }
        return SearchItem.builder()
                .id(match.getId())
                .title(match.getTitle())
                .description(match.getDescription())
                .startTime(match.getStartTime())
                .createdAt(match.getCreatedAt())
                .extra(extra)
                .build();
    }

    private SearchItem competitionToItem(Competition comp) {
        return SearchItem.builder()
                .id(comp.getId())
                .title(comp.getName())
                .thumbnailUrl(comp.getThumbnailUrl())
                .description(comp.getDescription())
                .createdAt(comp.getCreatedAt())
                .extra(Map.of(
                        "status", comp.getStatus().name(),
                        "season", comp.getSeason() != null ? comp.getSeason() : ""
                ))
                .build();
    }

    private SearchItem vodToItem(VodAsset vod) {
        return SearchItem.builder()
                .id(vod.getId())
                .title(vod.getTitle())
                .thumbnailUrl(vod.getThumbnailUrl())
                .createdAt(vod.getCreatedAt())
                .extra(Map.of("viewCount", vod.getViewCount()))
                .build();
    }

    private SearchItem clipToItem(ClipAsset clip) {
        return SearchItem.builder()
                .id(clip.getId())
                .title(clip.getTitle())
                .thumbnailUrl(clip.getThumbnailUrl())
                .createdAt(clip.getCreatedAt())
                .extra(Map.of("viewCount", clip.getViewCount()))
                .build();
    }
}
