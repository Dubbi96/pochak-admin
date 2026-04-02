package com.pochak.content.livestream.dto;

import com.pochak.content.livestream.entity.LiveStream.StreamVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLiveStreamRequest {

    @NotBlank(message = "방송 제목은 필수입니다")
    @Size(max = 255)
    private String title;

    private String description;

    private Long matchId;

    private String thumbnailUrl;

    @Builder.Default
    private StreamVisibility visibility = StreamVisibility.PUBLIC;

    private LocalDateTime scheduledAt;
}
