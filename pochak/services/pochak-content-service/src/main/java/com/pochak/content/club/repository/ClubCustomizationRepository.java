package com.pochak.content.club.repository;

import com.pochak.content.club.entity.ClubCustomization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubCustomizationRepository extends JpaRepository<ClubCustomization, Long> {

    Optional<ClubCustomization> findByClubIdAndPartnerId(Long clubId, Long partnerId);

    Optional<ClubCustomization> findByClubId(Long clubId);

    List<ClubCustomization> findAllByPartnerId(Long partnerId);
}
