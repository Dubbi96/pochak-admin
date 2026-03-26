package com.pochak.content.player.dto;

import com.pochak.content.home.dto.ContentCard;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDetailResponse {

    private Map<String, Object> asset;
    private PlayerMatchInfo matchInfo;
    private List<String> tags;
    private List<ContentCard> relatedLive;
    private List<ContentCard> userClips;
    private List<ContentCard> relatedClips;
    private List<ContentCard> relatedVods;
    private List<ContentCard> recommendedContents;
}
