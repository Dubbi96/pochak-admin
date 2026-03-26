package com.pochak.operation.camera.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.operation.camera.dto.CameraDetailResponse;
import com.pochak.operation.camera.dto.CameraListResponse;
import com.pochak.operation.camera.dto.CreateCameraRequest;
import com.pochak.operation.camera.service.CameraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cameras")
@RequiredArgsConstructor
public class CameraController {

    private final CameraService cameraService;

    @GetMapping
    public ApiResponse<List<CameraListResponse>> listCameras(
            @RequestParam(required = false) String name) {
        return ApiResponse.success(cameraService.listCameras(name));
    }

    @GetMapping("/{id}")
    public ApiResponse<CameraDetailResponse> getCamera(@PathVariable Long id) {
        return ApiResponse.success(cameraService.getCameraDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CameraDetailResponse> createCamera(@Valid @RequestBody CreateCameraRequest request) {
        return ApiResponse.success(cameraService.createCamera(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<CameraDetailResponse> updateCamera(
            @PathVariable Long id,
            @Valid @RequestBody CreateCameraRequest request) {
        return ApiResponse.success(cameraService.updateCamera(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteCamera(@PathVariable Long id) {
        cameraService.deleteCamera(id);
        return ApiResponse.success(null);
    }
}
