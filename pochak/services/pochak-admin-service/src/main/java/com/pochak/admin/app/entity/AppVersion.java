package com.pochak.admin.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_versions", schema = "admin")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class AppVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String platform;

    @Column(name = "version_code", nullable = false)
    private String versionCode;

    @Column(name = "version_name", nullable = false)
    private String versionName;

    @Column(name = "min_version_code")
    private String minVersionCode;

    @Column(name = "force_update")
    @Builder.Default
    private Boolean forceUpdate = false;

    @Column(name = "release_notes", columnDefinition = "TEXT")
    private String releaseNotes;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
