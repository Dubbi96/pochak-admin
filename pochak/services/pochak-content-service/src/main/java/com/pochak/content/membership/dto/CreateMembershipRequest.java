package com.pochak.content.membership.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMembershipRequest {

    @NotNull
    private Long userId;

    @NotNull
    private String targetType;

    @NotNull
    private Long targetId;

    private String role;

    private Long positionId;

    private Integer uniformNumber;

    private String nickname;

    /**
     * Required when role=GUARDIAN. The userId of the minor this guardian is responsible for.
     * Must correspond to a verified guardian relationship in identity-service.
     */
    private Long guardianForUserId;
}
