package com.pochak.identity.auth.repository;

import com.pochak.identity.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findTopByEmailAndPurposeAndIsVerifiedFalseOrderByCreatedAtDesc(
            String email, String purpose);

    Optional<EmailVerification> findByVerifiedTokenAndIsVerifiedTrue(String verifiedToken);

    long countByEmailAndPurposeAndCreatedAtAfter(String email, String purpose, LocalDateTime after);
}
