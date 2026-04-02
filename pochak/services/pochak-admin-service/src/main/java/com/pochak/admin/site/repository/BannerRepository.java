package com.pochak.admin.site.repository;

import com.pochak.admin.site.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByIsActiveTrueOrderBySortOrder();
}
