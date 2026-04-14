package com.pochak.operation.vpu.repository;

import com.pochak.operation.vpu.entity.DeviceStatus;
import com.pochak.operation.vpu.entity.VpuDevice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VpuDeviceRepository extends JpaRepository<VpuDevice, Long> {

    boolean existsBySerialNumber(String serialNumber);

    @Query("SELECT d FROM VpuDevice d WHERE " +
            "(:contractId IS NULL OR d.contractId = :contractId) " +
            "AND (:status IS NULL OR d.status = :status) " +
            "ORDER BY d.createdAt DESC")
    Page<VpuDevice> findByFilters(
            @Param("contractId") Long contractId,
            @Param("status") DeviceStatus status,
            Pageable pageable);
}
