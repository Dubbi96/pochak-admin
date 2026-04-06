package com.pochak.identity.user.entity;

import com.pochak.common.encryption.DeterministicEncryptConverter;
import com.pochak.common.encryption.LocalDateEncryptConverter;
import com.pochak.common.encryption.ProbabilisticEncryptConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Entity
@Table(name = "users", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Convert(converter = DeterministicEncryptConverter.class)
    @Column(nullable = false, unique = true, length = 500)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Convert(converter = ProbabilisticEncryptConverter.class)
    @Column(name = "phone_number", length = 500)
    private String phoneNumber;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Convert(converter = LocalDateEncryptConverter.class)
    @Column(name = "birth_date", length = 500)
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Column(name = "login_id", length = 100)
    private String loginId;

    @Column(name = "phone_verified")
    @Builder.Default
    private Boolean phoneVerified = false;

    @Column(name = "is_minor")
    @Builder.Default
    private Boolean isMinor = false;

    @Column(name = "guardian_user_id")
    private Long guardianUserId;

    @Convert(converter = ProbabilisticEncryptConverter.class)
    @Column(name = "guardian_phone", length = 500)
    private String guardianPhone;

    @Column(name = "guardian_consent_at")
    private LocalDateTime guardianConsentAt;

    @Column(name = "guardian_override_limit")
    private Integer guardianOverrideLimit;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(length = 50)
    private String nationality;

    @Column(name = "is_marketing")
    @Builder.Default
    private Boolean isMarketing = false;

    public void updateProfile(String nickname, String phoneNumber, String profileImageUrl) {
        if (nickname != null) this.nickname = nickname;
        if (phoneNumber != null) this.phoneNumber = phoneNumber;
        if (profileImageUrl != null) this.profileImageUrl = profileImageUrl;
    }

    public void updateProfile(String name, String phoneNumber, String email,
                              LocalDate birthDate, Gender gender, String profileImageUrl) {
        if (name != null) this.name = name;
        if (phoneNumber != null) this.phoneNumber = phoneNumber;
        if (email != null) this.email = email;
        if (birthDate != null) this.birthDate = birthDate;
        if (gender != null) this.gender = gender;
        if (profileImageUrl != null) this.profileImageUrl = profileImageUrl;
    }

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    /**
     * Clear all PII fields immediately upon withdrawal.
     * The email field is replaced with a deterministic hash so re-registration
     * with the same email can still be detected.
     */
    public void clearPii(String emailHash) {
        this.email = emailHash;
        this.name = "탈퇴한 사용자";
        this.phoneNumber = null;
        this.birthDate = null;
        this.guardianPhone = null;
        this.profileImageUrl = null;
        this.nationality = null;
        this.nickname = "withdrawn_" + this.id;
        this.passwordHash = null;
        this.loginId = null;
        this.guardianUserId = null;
        this.guardianConsentAt = null;
        this.guardianOverrideLimit = null;
        this.phoneVerified = false;
    }

    public void withdraw() {
        this.status = UserStatus.WITHDRAWN;
    }

    public void updateStatus(UserStatus status) {
        this.status = status;
    }

    public void updateRole(UserRole role) {
        this.role = role;
    }

    public enum UserStatus {
        ACTIVE, INACTIVE, SUSPENDED, WITHDRAWN, DORMANT_PENDING, DORMANT
    }

    public enum UserRole {
        USER, ADMIN, MANAGER, PARTNER
    }

    /**
     * 14세 미만 미성년자 여부 확인
     */
    public boolean isMinorByAge() {
        return birthDate != null && Period.between(birthDate, LocalDate.now()).getYears() < 14;
    }
}
