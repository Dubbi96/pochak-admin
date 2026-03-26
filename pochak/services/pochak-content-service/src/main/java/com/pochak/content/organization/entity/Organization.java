package com.pochak.content.organization.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizations", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Organization parent;

    @OneToMany(mappedBy = "parent")
    @Builder.Default
    private List<Organization> children = new ArrayList<>();

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "name_en", length = 200)
    private String nameEn;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "org_type", nullable = false, length = 50)
    private OrgType orgType;

    @Column(name = "sport_id")
    private Long sportId;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "can_host_competition", nullable = false)
    @Builder.Default
    private Boolean canHostCompetition = false;

    @Column(name = "is_auto_join", nullable = false)
    @Builder.Default
    private Boolean isAutoJoin = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_type", length = 20)
    @Builder.Default
    private AccessType accessType = AccessType.OPEN;

    @Column(name = "auto_approve", nullable = false)
    @Builder.Default
    private Boolean autoApprove = true;

    @Column(name = "manager_only_booking", nullable = false)
    @Builder.Default
    private Boolean managerOnlyBooking = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_content_visibility", length = 30)
    @Builder.Default
    private ContentVisibility defaultContentVisibility = ContentVisibility.PUBLIC;

    // === Policy v2 신규 필드 ===

    // 포착 시티/클럽 영역 구분
    @Enumerated(EnumType.STRING)
    @Column(name = "display_area", length = 10)
    @Builder.Default
    private DisplayArea displayArea = DisplayArea.CLUB;

    // 시티 인증 여부 (BO 관리자 인증)
    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    // 지역 코드 (시/군/구)
    @Column(name = "si_gun_gu_code", length = 10)
    private String siGunGuCode;

    // CUG (Closed User Group) 모드
    @Column(name = "is_cug")
    @Builder.Default
    private Boolean isCug = false;

    // 가입 정책
    @Enumerated(EnumType.STRING)
    @Column(name = "join_policy", length = 20)
    @Builder.Default
    private JoinPolicy joinPolicy = JoinPolicy.APPROVAL;

    // 촬영예약 정책
    @Enumerated(EnumType.STRING)
    @Column(name = "reservation_policy", length = 20)
    @Builder.Default
    private ReservationPolicy reservationPolicy = ReservationPolicy.MANAGER_ONLY;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum OrgType {
        ASSOCIATION, PRIVATE, PUBLIC
    }

    public enum AccessType {
        OPEN,   // 포착 시티 - open community
        CLOSED  // 포착 클럽 - closed/private community
    }

    public enum ContentVisibility {
        PUBLIC,       // visible to everyone
        MEMBERS_ONLY  // visible only to members
    }

    public void update(String name, String nameEn, String description, OrgType orgType,
                       Long sportId, String logoUrl, String websiteUrl,
                       Boolean canHostCompetition, Boolean isAutoJoin,
                       AccessType accessType, Boolean autoApprove,
                       Boolean managerOnlyBooking, ContentVisibility defaultContentVisibility,
                       DisplayArea displayArea, Boolean isVerified, String siGunGuCode,
                       Boolean isCug, JoinPolicy joinPolicy, ReservationPolicy reservationPolicy) {
        if (name != null) this.name = name;
        if (nameEn != null) this.nameEn = nameEn;
        if (description != null) this.description = description;
        if (orgType != null) this.orgType = orgType;
        if (sportId != null) this.sportId = sportId;
        if (logoUrl != null) this.logoUrl = logoUrl;
        if (websiteUrl != null) this.websiteUrl = websiteUrl;
        if (canHostCompetition != null) this.canHostCompetition = canHostCompetition;
        if (isAutoJoin != null) this.isAutoJoin = isAutoJoin;
        if (accessType != null) this.accessType = accessType;
        if (autoApprove != null) this.autoApprove = autoApprove;
        if (managerOnlyBooking != null) this.managerOnlyBooking = managerOnlyBooking;
        if (defaultContentVisibility != null) this.defaultContentVisibility = defaultContentVisibility;
        if (displayArea != null) this.displayArea = displayArea;
        if (isVerified != null) this.isVerified = isVerified;
        if (siGunGuCode != null) this.siGunGuCode = siGunGuCode;
        if (isCug != null) this.isCug = isCug;
        if (joinPolicy != null) this.joinPolicy = joinPolicy;
        if (reservationPolicy != null) this.reservationPolicy = reservationPolicy;
    }

    /**
     * Apply OPEN (City) defaults: auto-approve, public content, anyone can book.
     */
    public void applyOpenDefaults() {
        this.accessType = AccessType.OPEN;
        this.autoApprove = true;
        this.managerOnlyBooking = false;
        this.defaultContentVisibility = ContentVisibility.PUBLIC;
        this.isAutoJoin = true;
    }

    /**
     * Apply CLOSED (Club) defaults: manual approval, members-only content, manager booking.
     */
    public void applyClosedDefaults() {
        this.accessType = AccessType.CLOSED;
        this.autoApprove = false;
        this.managerOnlyBooking = true;
        this.defaultContentVisibility = ContentVisibility.MEMBERS_ONLY;
        this.isAutoJoin = false;
    }

    /**
     * Policy v2: clear CUG flag (set isCug = false).
     */
    public void clearCug() {
        this.isCug = false;
    }

    /**
     * Policy v2: set join policy.
     */
    public void setJoinPolicy(JoinPolicy joinPolicy) {
        this.joinPolicy = joinPolicy;
    }

    /**
     * Policy v2: set default content visibility.
     */
    public void setDefaultContentVisibility(ContentVisibility defaultContentVisibility) {
        this.defaultContentVisibility = defaultContentVisibility;
    }

    public void updateParent(Organization parent) {
        this.parent = parent;
    }

    public void softDelete() {
        this.active = false;
    }
}
