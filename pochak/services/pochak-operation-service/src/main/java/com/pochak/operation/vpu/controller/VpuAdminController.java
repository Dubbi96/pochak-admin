package com.pochak.operation.vpu.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.operation.vpu.dto.*;
import com.pochak.operation.vpu.entity.ContractStatus;
import com.pochak.operation.vpu.entity.DeviceStatus;
import com.pochak.operation.vpu.service.VpuContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/vpu")
@RequiredArgsConstructor
public class VpuAdminController {

    private final VpuContractService vpuContractService;

    // ──────────────────────────── Contracts ────────────────────────────

    @GetMapping("/contracts")
    public ApiResponse<java.util.List<VpuContractResponse>> getContracts(
            @RequestParam(required = false) ContractStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<VpuContractResponse> page = vpuContractService.getContracts(status, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @PostMapping("/contracts")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VpuContractResponse> createContract(
            @Valid @RequestBody VpuContractRequest request) {
        return ApiResponse.success(vpuContractService.createContract(request));
    }

    @GetMapping("/contracts/{id}")
    public ApiResponse<VpuContractResponse> getContract(@PathVariable Long id) {
        return ApiResponse.success(vpuContractService.getContract(id));
    }

    @PutMapping("/contracts/{id}")
    public ApiResponse<VpuContractResponse> updateContract(
            @PathVariable Long id,
            @Valid @RequestBody VpuContractRequest request) {
        return ApiResponse.success(vpuContractService.updateContract(id, request));
    }

    // ──────────────────────────── Devices ────────────────────────────

    @GetMapping("/devices")
    public ApiResponse<java.util.List<VpuDeviceResponse>> getDevices(
            @RequestParam(required = false) Long contractId,
            @RequestParam(required = false) DeviceStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<VpuDeviceResponse> page = vpuContractService.getDevices(contractId, status, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @PostMapping("/devices")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VpuDeviceResponse> registerDevice(
            @Valid @RequestBody VpuDeviceRequest request) {
        return ApiResponse.success(vpuContractService.registerDevice(request));
    }

    @PutMapping("/devices/{id}/status")
    public ApiResponse<VpuDeviceResponse> changeDeviceStatus(
            @PathVariable Long id,
            @Valid @RequestBody VpuDeviceStatusRequest request) {
        return ApiResponse.success(vpuContractService.changeDeviceStatus(id, request));
    }
}
