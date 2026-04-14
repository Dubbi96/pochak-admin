package com.pochak.operation.skylife.repository;

import com.pochak.operation.skylife.entity.CameraHubUnit;
import com.pochak.operation.skylife.entity.ChuStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CameraHubUnitRepository extends JpaRepository<CameraHubUnit, Long> {

    boolean existsByMacAddress(String macAddress);

    @Query("SELECT c FROM CameraHubUnit c WHERE " +
            "(:status IS NULL OR c.status = :status) " +
            "ORDER BY c.createdAt DESC")
    Page<CameraHubUnit> findByFilters(
            @Param("status") ChuStatus status,
            Pageable pageable);

    Page<CameraHubUnit> findByStatus(ChuStatus status, Pageable pageable);
}
