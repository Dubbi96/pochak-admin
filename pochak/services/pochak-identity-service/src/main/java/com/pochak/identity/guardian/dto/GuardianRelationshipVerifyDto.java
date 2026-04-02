package com.pochak.identity.guardian.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GuardianRelationshipVerifyDto {

    private Long guardianId;
    private Long minorId;
    private boolean verified;
}
