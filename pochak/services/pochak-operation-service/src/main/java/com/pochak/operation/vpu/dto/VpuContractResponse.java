package com.pochak.operation.vpu.dto;

import com.pochak.operation.vpu.entity.ContractStatus;
import com.pochak.operation.vpu.entity.VpuContract;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class VpuContractResponse {

    private Long id;
    private String contractNumber;
    private Long organizationId;
    private ContractStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer deviceCount;
    private String contactPerson;
    private String contactPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VpuContractResponse from(VpuContract contract) {
        return VpuContractResponse.builder()
                .id(contract.getId())
                .contractNumber(contract.getContractNumber())
                .organizationId(contract.getOrganizationId())
                .status(contract.getStatus())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .deviceCount(contract.getDeviceCount())
                .contactPerson(contract.getContactPerson())
                .contactPhone(contract.getContactPhone())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}
