package com.pochak.content.comment.dto;

import com.pochak.content.comment.entity.Comment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    private Long id;
    private Long contentId;
    private String contentType;
    private Long userId;
    private String body;
    private Long parentId;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .contentId(comment.getContentId())
                .contentType(comment.getContentType())
                .userId(comment.getUserId())
                .body(comment.getBody())
                .parentId(comment.getParentId())
                .isDeleted(comment.getIsDeleted())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
