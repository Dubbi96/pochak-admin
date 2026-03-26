package com.pochak.content.membership.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectMembershipRequest {

    @NotNull
    private Long managerId;

    private String reason;
}
