package com.pochak.content.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchSection {

    private SearchType type;
    private LayoutType layout;
    private List<SearchItem> items;
    private long totalCount;

    public enum SearchType {
        TEAM, CLUB, LIVE, SCHEDULE, COMPETITION, VIDEO, CLIP
    }

    public enum LayoutType {
        HORIZONTAL, VERTICAL
    }
}
