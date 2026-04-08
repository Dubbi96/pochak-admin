package com.pochak.identity.partner.repository;

import com.pochak.identity.partner.entity.Partner;
import com.pochak.identity.partner.entity.PartnerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PartnerRepository extends JpaRepository<Partner, Long> {

    Optional<Partner> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByBusinessNumber(String businessNumber);

    Page<Partner> findByStatus(PartnerStatus status, Pageable pageable);
}
