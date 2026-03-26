package com.pochak.identity.guardian.dto;

import com.pochak.identity.guardian.entity.GuardianRelationship;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianResponseDto {

    private Long id;
    private Long guardianId;
    private Long minorId;
    private String status;
    private String consentMethod;
    private LocalDateTime consentedAt;
    private Integer monthlyPaymentLimit;
    private LocalDateTime createdAt;

    public static GuardianResponseDto from(GuardianRelationship rel) {
        return GuardianResponseDto.builder()
                .id(rel.getId())
                .guardianId(rel.getGuardianId())
                .minorId(rel.getMinorId())
                .status(rel.getStatus().name())
                .consentMethod(rel.getConsentMethod().name())
                .consentedAt(rel.getConsentedAt())
                .monthlyPaymentLimit(rel.getMonthlyPaymentLimit())
                .createdAt(rel.getCreatedAt())
                .build();
    }
}
