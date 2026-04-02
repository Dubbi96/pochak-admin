package com.pochak.operation.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * M8: DTO for membership info returned by Content Service.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipResponse {
    private Long userId;
    private Long organizationId;
    private MembershipRole role;
}
