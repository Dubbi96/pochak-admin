package com.pochak.operation.camera.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.camera.dto.CameraDetailResponse;
import com.pochak.operation.camera.dto.CameraListResponse;
import com.pochak.operation.camera.dto.CreateCameraRequest;
import com.pochak.operation.camera.entity.Camera;
import com.pochak.operation.camera.repository.CameraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CameraService {

    private final CameraRepository cameraRepository;

    public List<Camera> getActiveCameras() {
        return cameraRepository.findByIsActiveTrue();
    }

    public List<CameraListResponse> listCameras(String name) {
        List<Camera> cameras = cameraRepository.findByIsActiveTrue();
        if (name != null && !name.isBlank()) {
            cameras = cameras.stream()
                    .filter(c -> c.getName().toLowerCase().contains(name.toLowerCase()))
                    .toList();
        }
        return cameras.stream()
                .map(CameraListResponse::from)
                .toList();
    }

    public CameraDetailResponse getCameraDetail(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Camera not found: " + id));
        return CameraDetailResponse.from(camera);
    }

    @Transactional
    public Camera createCamera(Camera camera) {
        return cameraRepository.save(camera);
    }

    @Transactional
    public CameraDetailResponse createCamera(CreateCameraRequest request) {
        Camera camera = Camera.builder()
                .name(request.getName())
                .serialNumber(request.getSerialNumber())
                .model(request.getModel())
                .manufacturer(request.getManufacturer())
                .pixellotDeviceId(request.getPixellotDeviceId())
                .build();

        Camera saved = cameraRepository.save(camera);
        return CameraDetailResponse.from(saved);
    }

    @Transactional
    public CameraDetailResponse updateCamera(Long id, CreateCameraRequest request) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Camera not found: " + id));

        camera.update(
                request.getName(),
                request.getSerialNumber(),
                request.getModel(),
                request.getManufacturer(),
                request.getPixellotDeviceId()
        );

        return CameraDetailResponse.from(camera);
    }

    @Transactional
    public void deleteCamera(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Camera not found: " + id));
        camera.softDelete();
    }
}
