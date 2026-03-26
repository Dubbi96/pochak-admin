package com.pochak.content.competition.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "competition_visits", schema = "content",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "competition_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CompetitionVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @CreationTimestamp
    @Column(name = "first_visited_at", nullable = false, updatable = false)
    private LocalDateTime firstVisitedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "invite_code_version", length = 50)
    private String inviteCodeVersion;

    public boolean isValid() {
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) {
            return false;
        }
        if (inviteCodeVersion != null && competition != null
                && competition.getInviteCode() != null
                && !inviteCodeVersion.equals(competition.getInviteCode())) {
            return false;
        }
        return true;
    }
}
