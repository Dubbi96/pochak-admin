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
public class SearchRecommendations {

    private List<SearchItem> clips;
    private List<SearchItem> vods;
}
