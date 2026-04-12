package com.pochak.content.site.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organization_site_themes", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrganizationSiteTheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private OrganizationSite site;

    @Column(name = "primary_color", length = 20)
    private String primaryColor;

    @Column(name = "secondary_color", length = 20)
    private String secondaryColor;

    @Column(name = "font_family", length = 100)
    private String fontFamily;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "custom_css", columnDefinition = "TEXT")
    private String customCss;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void update(String primaryColor, String secondaryColor, String fontFamily,
                       String logoUrl, String bannerUrl, String customCss) {
        if (primaryColor != null) this.primaryColor = primaryColor;
        if (secondaryColor != null) this.secondaryColor = secondaryColor;
        if (fontFamily != null) this.fontFamily = fontFamily;
        if (logoUrl != null) this.logoUrl = logoUrl;
        if (bannerUrl != null) this.bannerUrl = bannerUrl;
        if (customCss != null) this.customCss = customCss;
    }
}
