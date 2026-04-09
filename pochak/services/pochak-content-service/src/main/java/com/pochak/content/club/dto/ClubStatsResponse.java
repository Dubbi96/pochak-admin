package com.pochak.content.club.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubStatsResponse {

    private Long clubId;
    private long totalMembers;
    private long totalPosts;
}
