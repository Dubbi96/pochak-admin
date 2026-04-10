package com.pochak.admin.site.repository;

import com.pochak.admin.site.entity.Banner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByIsActiveTrueOrderBySortOrder();

    Page<Banner> findByIsActiveTrue(Pageable pageable);

    Page<Banner> findByIsActiveFalse(Pageable pageable);

    Page<Banner> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
