package com.pochak.content.home.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentSection {

    private Long sectionId;
    private String title;
    private String type;
    private List<ContentCard> items;
}
