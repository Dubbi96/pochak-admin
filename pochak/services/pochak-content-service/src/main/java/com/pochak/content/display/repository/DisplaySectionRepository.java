package com.pochak.content.display.repository;

import com.pochak.content.display.entity.DisplaySection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DisplaySectionRepository extends JpaRepository<DisplaySection, Long> {

    List<DisplaySection> findByActiveTrueAndTargetPageOrderByDisplayOrderAsc(String targetPage);

    Optional<DisplaySection> findByAdminBannerId(Long adminBannerId);
}
