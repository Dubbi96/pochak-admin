package com.pochak.commerce.settlement.repository;

import com.pochak.commerce.settlement.entity.PartnerSettlement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerSettlementRepository extends JpaRepository<PartnerSettlement, Long> {

    Page<PartnerSettlement> findByPartnerIdOrderByCreatedAtDesc(Long partnerId, Pageable pageable);
}
