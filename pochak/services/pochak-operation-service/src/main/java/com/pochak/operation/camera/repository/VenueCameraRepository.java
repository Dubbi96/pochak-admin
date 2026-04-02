package com.pochak.operation.camera.repository;

import com.pochak.operation.camera.entity.VenueCamera;
import com.pochak.operation.camera.entity.VenueCameraId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueCameraRepository extends JpaRepository<VenueCamera, VenueCameraId> {

    List<VenueCamera> findByIdVenueId(Long venueId);

    long countByIdVenueId(Long venueId);

    void deleteByIdVenueIdAndIdCameraId(Long venueId, Long cameraId);
}
