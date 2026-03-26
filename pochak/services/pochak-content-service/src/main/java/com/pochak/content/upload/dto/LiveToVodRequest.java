package com.pochak.content.upload.dto;

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
public class LiveToVodRequest {

    @NotNull(message = "transcodeSessionId is required")
    private Long transcodeSessionId;

    @Size(max = 200, message = "title must not exceed 200 characters")
    private String title;

    @Size(max = 2000, message = "description must not exceed 2000 characters")
    private String description;

    @Size(max = 20, message = "Maximum 20 tags allowed")
    private List<String> tags;

    private Long matchId;

    @Builder.Default
    private boolean trimStart = false; // remove pre-match silence

    @Builder.Default
    private boolean trimEnd = false;   // remove post-match silence
}
