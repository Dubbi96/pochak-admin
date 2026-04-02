package com.pochak.content.membership.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinOrganizationRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long organizationId;

    private String nickname;
}
