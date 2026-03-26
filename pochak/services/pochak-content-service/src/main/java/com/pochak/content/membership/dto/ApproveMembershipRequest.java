package com.pochak.content.membership.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveMembershipRequest {

    @NotNull
    private Long managerId;
}
