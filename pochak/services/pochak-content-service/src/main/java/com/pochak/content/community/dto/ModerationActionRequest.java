package com.pochak.content.community.dto;

import com.pochak.content.community.entity.ModerationAction;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ModerationActionRequest {

    @NotNull
    private ModerationAction.ActionType actionType;

    private String reason;
}
