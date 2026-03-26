package com.pochak.identity.user.entity;

import com.pochak.identity.user.dto.AreaPreference;
import com.pochak.identity.user.dto.SportPreference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_preferences", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preferred_sports", columnDefinition = "jsonb")
    @Builder.Default
    private List<SportPreference> preferredSports = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preferred_areas", columnDefinition = "jsonb")
    @Builder.Default
    private List<AreaPreference> preferredAreas = new ArrayList<>();

    @Column(name = "usage_purpose", length = 50)
    private String usagePurpose;

    @Column(name = "preferred_language", length = 10)
    @Builder.Default
    private String preferredLanguage = "ko";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void updatePreferences(List<SportPreference> preferredSports,
                                  List<AreaPreference> preferredAreas,
                                  String usagePurpose) {
        if (preferredSports != null) this.preferredSports = preferredSports;
        if (preferredAreas != null) this.preferredAreas = preferredAreas;
        if (usagePurpose != null) this.usagePurpose = usagePurpose;
    }
}
