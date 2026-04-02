package com.pochak.operation.camera.repository;

import com.pochak.operation.camera.entity.Camera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CameraRepository extends JpaRepository<Camera, Long> {

    List<Camera> findByIsActiveTrue();

    Optional<Camera> findBySerialNumber(String serialNumber);
}
