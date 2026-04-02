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
public class TrendingSearchResponse {

    private List<TrendingTerm> terms;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendingTerm {
        private int rank;
        private String keyword;
        private String changeDirection;
    }
}
