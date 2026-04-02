package com.pochak.content.search.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UnifiedSearchResponse {

    private String query;
    private List<SearchSection> sections;
    private SearchRecommendations recommendations;

    /**
     * Returns a summary of result counts per section type.
     * e.g., {"VIDEO": 5, "CLIP": 3, "TEAM": 2, "COMPETITION": 1}
     */
    public Map<String, Long> getSectionCounts() {
        if (sections == null || sections.isEmpty()) {
            return null;
        }
        return sections.stream()
                .collect(Collectors.toMap(
                        s -> s.getType().name(),
                        SearchSection::getTotalCount
                ));
    }

    public int getTotalResultCount() {
        if (sections == null) return 0;
        return sections.stream()
                .mapToInt(s -> s.getItems() != null ? s.getItems().size() : 0)
                .sum();
    }
}
