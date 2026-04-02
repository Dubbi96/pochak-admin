package com.pochak.content.asset.dto.tag;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAssetTagRequest {

    private Integer sportTagId;

    @NotBlank(message = "assetType is required")
    private String assetType;

    @NotNull(message = "assetId is required")
    private Long assetId;

    @NotNull(message = "taggerUserId is required")
    private Long taggerUserId;

    @NotNull(message = "tagTimeSec is required")
    private Integer tagTimeSec;

    @NotBlank(message = "tagName is required")
    private String tagName;

    private Long teamId;
    private Integer uniformNumber;
}
