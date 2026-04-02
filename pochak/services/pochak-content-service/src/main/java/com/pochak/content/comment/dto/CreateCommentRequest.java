package com.pochak.content.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String body;

    private Long parentId; // nullable, for replies
}
