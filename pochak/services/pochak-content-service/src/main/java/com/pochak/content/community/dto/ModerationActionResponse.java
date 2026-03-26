package com.pochak.content.community.dto;

import com.pochak.content.community.entity.ModerationAction;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationActionResponse {

    private Long id;
    private Long postId;
    private Long moderatorUserId;
    private ModerationAction.ActionType actionType;
    private String reason;
    private LocalDateTime createdAt;

    public static ModerationActionResponse from(ModerationAction action) {
        return ModerationActionResponse.builder()
                .id(action.getId())
                .postId(action.getPostId())
                .moderatorUserId(action.getModeratorUserId())
                .actionType(action.getActionType())
                .reason(action.getReason())
                .createdAt(action.getCreatedAt())
                .build();
    }
}
