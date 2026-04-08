package com.pochak.identity.partner.repository;

import com.pochak.identity.partner.entity.PartnerVenue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartnerVenueRepository extends JpaRepository<PartnerVenue, Long> {

    List<PartnerVenue> findByPartnerId(Long partnerId);
}
