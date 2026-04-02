package com.pochak.admin.app.controller;

import com.pochak.admin.app.entity.AppVersion;
import com.pochak.admin.app.repository.AppVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/admin/api/v1/app/versions")
@RequiredArgsConstructor
public class AppVersionController {

    private final AppVersionRepository appVersionRepository;

    @GetMapping
    public ResponseEntity<List<AppVersion>> getVersions(@RequestParam(required = false) String platform) {
        if (platform != null) {
            return ResponseEntity.ok(appVersionRepository.findByPlatformAndIsActiveTrueOrderByCreatedAtDesc(platform));
        }
        return ResponseEntity.ok(appVersionRepository.findAll());
    }

    @GetMapping("/latest")
    public ResponseEntity<AppVersion> getLatestVersion(@RequestParam String platform) {
        AppVersion version = appVersionRepository.findFirstByPlatformAndIsActiveTrueOrderByCreatedAtDesc(platform)
                .orElseThrow(() -> new IllegalArgumentException("No version found for platform: " + platform));
        return ResponseEntity.ok(version);
    }

    @PostMapping
    public ResponseEntity<AppVersion> createVersion(@RequestBody AppVersion appVersion) {
        AppVersion saved = appVersionRepository.save(appVersion);
        return ResponseEntity.created(URI.create("/admin/api/v1/app/versions/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVersion(@PathVariable Long id) {
        appVersionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
