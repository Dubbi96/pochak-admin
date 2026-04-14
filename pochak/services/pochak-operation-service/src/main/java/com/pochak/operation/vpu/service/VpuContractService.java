package com.pochak.operation.vpu.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.vpu.dto.*;
import com.pochak.operation.vpu.entity.ContractStatus;
import com.pochak.operation.vpu.entity.DeviceStatus;
import com.pochak.operation.vpu.entity.VpuContract;
import com.pochak.operation.vpu.entity.VpuDevice;
import com.pochak.operation.vpu.repository.VpuContractRepository;
import com.pochak.operation.vpu.repository.VpuDeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VpuContractService {

    private final VpuContractRepository contractRepository;
    private final VpuDeviceRepository deviceRepository;

    public Page<VpuContractResponse> getContracts(ContractStatus status, Pageable pageable) {
        return contractRepository.findByFilters(status, pageable)
                .map(VpuContractResponse::from);
    }

    public VpuContractResponse getContract(Long id) {
        return VpuContractResponse.from(findContractById(id));
    }

    @Transactional
    public VpuContractResponse createContract(VpuContractRequest request) {
        if (contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "Contract number already exists: " + request.getContractNumber());
        }

        VpuContract contract = VpuContract.builder()
                .contractNumber(request.getContractNumber())
                .organizationId(request.getOrganizationId())
                .status(request.getStatus() != null ? request.getStatus() : ContractStatus.PENDING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .deviceCount(request.getDeviceCount() != null ? request.getDeviceCount() : 0)
                .contactPerson(request.getContactPerson())
                .contactPhone(request.getContactPhone())
                .build();

        return VpuContractResponse.from(contractRepository.save(contract));
    }

    @Transactional
    public VpuContractResponse updateContract(Long id, VpuContractRequest request) {
        VpuContract contract = findContractById(id);

        contract.update(
                request.getStatus() != null ? request.getStatus() : contract.getStatus(),
                request.getStartDate(),
                request.getEndDate(),
                request.getDeviceCount() != null ? request.getDeviceCount() : contract.getDeviceCount(),
                request.getContactPerson(),
                request.getContactPhone()
        );

        return VpuContractResponse.from(contract);
    }

    public Page<VpuDeviceResponse> getDevices(Long contractId, DeviceStatus status, Pageable pageable) {
        return deviceRepository.findByFilters(contractId, status, pageable)
                .map(VpuDeviceResponse::from);
    }

    @Transactional
    public VpuDeviceResponse registerDevice(VpuDeviceRequest request) {
        if (deviceRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "Serial number already registered: " + request.getSerialNumber());
        }

        // Validate contract exists
        findContractById(request.getContractId());

        VpuDevice device = VpuDevice.builder()
                .contractId(request.getContractId())
                .serialNumber(request.getSerialNumber())
                .firmwareVersion(request.getFirmwareVersion())
                .location(request.getLocation())
                .build();

        return VpuDeviceResponse.from(deviceRepository.save(device));
    }

    @Transactional
    public VpuDeviceResponse changeDeviceStatus(Long id, VpuDeviceStatusRequest request) {
        VpuDevice device = deviceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "VPU device not found: " + id));

        device.changeStatus(request.getStatus());
        return VpuDeviceResponse.from(device);
    }

    private VpuContract findContractById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "VPU contract not found: " + id));
    }
}
