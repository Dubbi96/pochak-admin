package com.pochak.content.site.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organization_sites", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrganizationSite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_type", nullable = false, length = 30)
    private String ownerType;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "meta_title", length = 200)
    private String metaTitle;

    @Column(name = "meta_description", length = 500)
    private String metaDescription;

    @Column(name = "favicon_url", length = 500)
    private String faviconUrl;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean published = false;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<OrganizationSitePage> pages = new ArrayList<>();

    @OneToOne(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    private OrganizationSiteTheme theme;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void publish() {
        this.published = true;
    }

    public void unpublish() {
        this.published = false;
    }

    public void updateMeta(String title, String description, String metaTitle, String metaDescription) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (metaTitle != null) this.metaTitle = metaTitle;
        if (metaDescription != null) this.metaDescription = metaDescription;
    }
}
