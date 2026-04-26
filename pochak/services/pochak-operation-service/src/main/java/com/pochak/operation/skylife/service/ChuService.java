package com.pochak.operation.skylife.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.skylife.dto.ChuRequest;
import com.pochak.operation.skylife.dto.ChuResponse;
import com.pochak.operation.skylife.entity.CameraHubUnit;
import com.pochak.operation.skylife.entity.ChuStatus;
import com.pochak.operation.skylife.repository.CameraHubUnitRepository;
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
public class ChuService {

    private final CameraHubUnitRepository chuRepository;

    public Page<ChuResponse> getChus(ChuStatus status, Pageable pageable) {
        return chuRepository.findByFilters(status, pageable)
                .map(ChuResponse::from);
    }

    public ChuResponse getChu(Long id) {
        return ChuResponse.from(findById(id));
    }

    @Transactional
    public ChuResponse registerChu(ChuRequest request) {
        if (chuRepository.existsByMacAddress(request.getMacAddress())) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "MAC address already registered: " + request.getMacAddress());
        }

        CameraHubUnit chu = CameraHubUnit.builder()
                .contractId(request.getContractId())
                .macAddress(request.getMacAddress())
                .ipAddress(request.getIpAddress())
                .firmwareVersion(request.getFirmwareVersion())
                .location(request.getLocation())
                .build();

        return ChuResponse.from(chuRepository.save(chu));
    }

    @Transactional
    public ChuResponse connect(Long id) {
        CameraHubUnit chu = findById(id);
        chu.connect();
        log.info("[CHU] Unit {} connected at {}", id, chu.getLastConnectedAt());
        return ChuResponse.from(chu);
    }

    @Transactional
    public ChuResponse disconnect(Long id) {
        CameraHubUnit chu = findById(id);
        chu.disconnect();
        log.info("[CHU] Unit {} disconnected", id);
        return ChuResponse.from(chu);
    }

    public Page<ChuResponse> getActivatedChus(Pageable pageable) {
        return chuRepository.findByStatus(ChuStatus.CONNECTED, pageable)
                .map(ChuResponse::from);
    }

    private CameraHubUnit findById(Long id) {
        return chuRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Camera Hub Unit not found: " + id));
    }
}
