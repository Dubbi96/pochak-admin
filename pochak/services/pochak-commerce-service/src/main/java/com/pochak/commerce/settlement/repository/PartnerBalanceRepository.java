package com.pochak.commerce.settlement.repository;

import com.pochak.commerce.settlement.entity.PartnerBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartnerBalanceRepository extends JpaRepository<PartnerBalance, Long> {

    Optional<PartnerBalance> findByPartnerId(Long partnerId);
}
