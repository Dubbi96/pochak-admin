package com.pochak.content.acl.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Video ACL entity — stores per-content access control rules.
 *
 * <h3>Policy JSONB Schema (BIZ-003/004 unified "단체")</h3>
 * <pre>
 * {
 *   "blockedUsers":       [Long],          // explicit user blocklist (checked first)
 *   "allowedUsers":       [Long],          // explicit user whitelist (overrides policy)
 *   "allowedRoles":       ["MANAGER","MEMBER"],  // role-level check within group memberships
 *
 *   // === Unified "단체" group key (BIZ-003) ===
 *   "allowedGroups":      [Long],          // unified group IDs (Organization + Team treated equally)
 *
 *   // === Legacy keys (backward-compatible, merged into allowedGroups at runtime) ===
 *   "allowedOrganizations": [Long],        // deprecated — use allowedGroups
 *   "allowedTeams":         [Long],        // deprecated — use allowedGroups
 *
 *   // === Compound policy (BIZ-004) ===
 *   "additionalPolicies": ["SUBSCRIBERS"], // additional policies to evaluate alongside defaultPolicy
 *   "combineMode":        "AND" | "OR"     // how to combine results (default: "AND")
 * }
 * </pre>
 */
@Entity
@Table(name = "video_acl", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class VideoAcl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 20)
    private ContentType contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_policy", nullable = false, length = 30)
    @Builder.Default
    private DefaultPolicy defaultPolicy = DefaultPolicy.PUBLIC;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> policy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum ContentType {
        LIVE, VOD, CLIP
    }

    public enum DefaultPolicy {
        PUBLIC, AUTHENTICATED, SUBSCRIBERS, MEMBERS_ONLY, PRIVATE
    }

    public void updatePolicy(DefaultPolicy defaultPolicy, Map<String, Object> policy) {
        if (defaultPolicy != null) this.defaultPolicy = defaultPolicy;
        if (policy != null) this.policy = policy;
    }
}
