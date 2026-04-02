package com.pochak.admin.app.repository;

import com.pochak.admin.app.entity.AppVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppVersionRepository extends JpaRepository<AppVersion, Long> {

    List<AppVersion> findByPlatformAndIsActiveTrueOrderByCreatedAtDesc(String platform);

    Optional<AppVersion> findFirstByPlatformAndIsActiveTrueOrderByCreatedAtDesc(String platform);
}
