package com.pochak.content.community.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_posts", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CommunityPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "author_user_id", nullable = false)
    private Long authorUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false, length = 20)
    private PostType postType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @Column(name = "si_gun_gu_code", length = 10)
    private String siGunGuCode;

    @Column(name = "is_pinned")
    @Builder.Default
    private Boolean isPinned = false;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    @Column(name = "comment_count")
    @Builder.Default
    private Integer commentCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", length = 20)
    @Builder.Default
    private ModerationStatus moderationStatus = ModerationStatus.APPROVED;

    @Column(name = "warning_count")
    @Builder.Default
    private Integer warningCount = 0;

    @Column(name = "auto_flag_reason")
    private String autoFlagReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum PostType {
        NEWS, RECRUITING, RECRUITMENT, FREE
    }

    public void pin() {
        this.isPinned = true;
    }

    public void unpin() {
        this.isPinned = false;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public void update(String title, String body, String imageUrls) {
        if (title != null) this.title = title;
        if (body != null) this.body = body;
        if (imageUrls != null) this.imageUrls = imageUrls;
    }

    public boolean isOwnedBy(Long userId) {
        return this.authorUserId.equals(userId);
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    public void setModerationStatus(ModerationStatus status) {
        this.moderationStatus = status;
    }

    public void incrementWarningCount() {
        this.warningCount = (this.warningCount == null ? 0 : this.warningCount) + 1;
    }

    public void flagByAi(String reason) {
        this.moderationStatus = ModerationStatus.PENDING;
        this.autoFlagReason = reason;
    }
}
