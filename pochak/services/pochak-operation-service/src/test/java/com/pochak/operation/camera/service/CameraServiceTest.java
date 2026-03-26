package com.pochak.operation.camera.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.operation.camera.dto.CameraDetailResponse;
import com.pochak.operation.camera.dto.CameraListResponse;
import com.pochak.operation.camera.dto.CreateCameraRequest;
import com.pochak.operation.camera.entity.Camera;
import com.pochak.operation.camera.repository.CameraRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class CameraServiceTest {

    @Mock
    private CameraRepository cameraRepository;

    @InjectMocks
    private CameraService cameraService;

    private Camera testCamera;

    @BeforeEach
    void setUp() {
        testCamera = Camera.builder()
                .id(1L)
                .name("Camera Alpha")
                .serialNumber("SN-ALPHA-001")
                .model("Pixellot S2")
                .manufacturer("Pixellot")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should list active cameras")
    void testListCameras() {
        // given
        Camera camera2 = Camera.builder()
                .id(2L).name("Camera Beta").serialNumber("SN-BETA-002")
                .model("Pixellot S3").manufacturer("Pixellot").isActive(true).build();

        given(cameraRepository.findByIsActiveTrue()).willReturn(List.of(testCamera, camera2));

        // when
        List<CameraListResponse> result = cameraService.listCameras(null);

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Camera Alpha");
        assertThat(result.get(1).getName()).isEqualTo("Camera Beta");
    }

    @Test
    @DisplayName("Should list cameras filtered by name")
    void testListCamerasFilteredByName() {
        // given
        Camera camera2 = Camera.builder()
                .id(2L).name("Camera Beta").serialNumber("SN-BETA-002")
                .model("Pixellot S3").manufacturer("Pixellot").isActive(true).build();

        given(cameraRepository.findByIsActiveTrue()).willReturn(List.of(testCamera, camera2));

        // when
        List<CameraListResponse> result = cameraService.listCameras("Alpha");

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Camera Alpha");
    }

    @Test
    @DisplayName("Should create a camera")
    void testCreateCamera() {
        // given
        CreateCameraRequest request = CreateCameraRequest.builder()
                .name("New Camera")
                .serialNumber("SN-NEW-001")
                .model("Model Z")
                .manufacturer("Sony")
                .build();

        Camera savedCamera = Camera.builder()
                .id(10L).name("New Camera").serialNumber("SN-NEW-001")
                .model("Model Z").manufacturer("Sony").isActive(true).build();

        given(cameraRepository.save(any(Camera.class))).willReturn(savedCamera);

        // when
        CameraDetailResponse result = cameraService.createCamera(request);

        // then
        assertThat(result.getName()).isEqualTo("New Camera");
        assertThat(result.getSerialNumber()).isEqualTo("SN-NEW-001");
        assertThat(result.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when camera not found")
    void getCameraDetail_notFound() {
        // given
        given(cameraRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> cameraService.getCameraDetail(999L))
                .isInstanceOf(BusinessException.class);
    }
}
