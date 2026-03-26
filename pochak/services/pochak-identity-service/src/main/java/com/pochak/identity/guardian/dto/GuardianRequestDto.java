package com.pochak.identity.guardian.dto;

import com.pochak.identity.guardian.entity.GuardianRelationship.ConsentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GuardianRequestDto {

    @NotNull(message = "미성년자 ID는 필수입니다")
    private Long minorId;

    @NotNull(message = "인증 방법은 필수입니다")
    private ConsentMethod consentMethod;
}
