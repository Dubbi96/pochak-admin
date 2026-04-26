package com.pochak.operation.vpu.dto;

import com.pochak.operation.vpu.entity.ContractStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VpuContractRequest {

    @NotBlank(message = "Contract number is required")
    private String contractNumber;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    private ContractStatus status;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer deviceCount;

    private String contactPerson;

    private String contactPhone;
}
