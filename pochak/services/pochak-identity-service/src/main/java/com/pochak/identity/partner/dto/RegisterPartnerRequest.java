package com.pochak.identity.partner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterPartnerRequest {

    @NotBlank(message = "Business name is required")
    private String businessName;

    @NotBlank(message = "Business number is required")
    private String businessNumber;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    private String bankAccount;
    private String bankName;
}
