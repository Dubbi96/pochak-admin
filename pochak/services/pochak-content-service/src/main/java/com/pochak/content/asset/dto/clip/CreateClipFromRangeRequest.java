package com.pochak.content.asset.dto.clip;

import com.pochak.content.asset.entity.ClipAsset;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateClipFromRangeRequest {

    public enum AspectRatio {
        RATIO_16_9,
        RATIO_9_16
    }

    @NotNull(message = "sourceContentType is required")
    private ClipAsset.SourceType sourceContentType;

    @NotNull(message = "sourceContentId is required")
    private Long sourceContentId;

    @NotNull(message = "startTimeSeconds is required")
    @Min(value = 0, message = "startTimeSeconds must be >= 0")
    private Integer startTimeSeconds;

    @NotNull(message = "endTimeSeconds is required")
    @Min(value = 0, message = "endTimeSeconds must be >= 0")
    private Integer endTimeSeconds;

    @NotBlank(message = "title is required")
    @Size(max = 25, message = "title must not exceed 25 characters")
    private String title;

    @Size(max = 500, message = "description must not exceed 500 characters")
    private String description;

    @Size(max = 20, message = "Maximum 20 tags allowed")
    private List<String> tags;

    @Builder.Default
    private AspectRatio aspectRatio = AspectRatio.RATIO_16_9;
}
