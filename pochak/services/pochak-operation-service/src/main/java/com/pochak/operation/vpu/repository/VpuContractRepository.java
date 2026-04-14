package com.pochak.operation.vpu.repository;

import com.pochak.operation.vpu.entity.ContractStatus;
import com.pochak.operation.vpu.entity.VpuContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VpuContractRepository extends JpaRepository<VpuContract, Long> {

    boolean existsByContractNumber(String contractNumber);

    @Query("SELECT c FROM VpuContract c WHERE " +
            "(:status IS NULL OR c.status = :status) " +
            "ORDER BY c.createdAt DESC")
    Page<VpuContract> findByFilters(
            @Param("status") ContractStatus status,
            Pageable pageable);
}
