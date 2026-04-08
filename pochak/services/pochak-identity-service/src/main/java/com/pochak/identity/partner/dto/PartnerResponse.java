package com.pochak.identity.partner.dto;

import com.pochak.identity.partner.entity.Partner;
import com.pochak.identity.partner.entity.PartnerStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PartnerResponse {

    private Long id;
    private Long userId;
    private String businessName;
    private String businessNumber;
    private String contactPhone;
    private String bankAccount;
    private String bankName;
    private BigDecimal commissionRate;
    private PartnerStatus status;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PartnerResponse from(Partner partner) {
        return PartnerResponse.builder()
                .id(partner.getId())
                .userId(partner.getUserId())
                .businessName(partner.getBusinessName())
                .businessNumber(partner.getBusinessNumber())
                .contactPhone(partner.getContactPhone())
                .bankAccount(partner.getBankAccount())
                .bankName(partner.getBankName())
                .commissionRate(partner.getCommissionRate())
                .status(partner.getStatus())
                .approvedAt(partner.getApprovedAt())
                .createdAt(partner.getCreatedAt())
                .updatedAt(partner.getUpdatedAt())
                .build();
    }
}
