package com.pochak.content.display.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "display_sections", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DisplaySection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "section_type", nullable = false, length = 50)
    private String sectionType;

    @Column(name = "content_query", length = 500)
    private String contentQuery;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "admin_banner_id")
    private Long adminBannerId;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "target_page", length = 50)
    @Builder.Default
    private String targetPage = "HOME";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
