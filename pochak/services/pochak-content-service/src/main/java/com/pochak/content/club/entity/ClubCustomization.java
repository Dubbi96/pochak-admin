package com.pochak.content.club.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "club_customizations", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ClubCustomization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "club_id", nullable = false)
    private Long clubId;

    @Column(name = "partner_id", nullable = false)
    private Long partnerId;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "theme_color", length = 20)
    private String themeColor;

    @Column(name = "intro_text")
    private String introText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sections_json", columnDefinition = "jsonb")
    private Object sectionsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "social_links_json", columnDefinition = "jsonb")
    private Map<String, String> socialLinksJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void update(String bannerUrl, String logoUrl, String themeColor, String introText,
                       Object sectionsJson, Map<String, String> socialLinksJson) {
        this.bannerUrl = bannerUrl;
        this.logoUrl = logoUrl;
        this.themeColor = themeColor;
        this.introText = introText;
        this.sectionsJson = sectionsJson;
        this.socialLinksJson = socialLinksJson;
    }
}
