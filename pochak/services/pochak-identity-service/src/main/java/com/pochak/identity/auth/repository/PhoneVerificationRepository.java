package com.pochak.identity.auth.repository;

import com.pochak.identity.auth.entity.PhoneVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long> {

    Optional<PhoneVerification> findTopByPhoneAndPurposeAndIsVerifiedFalseOrderByCreatedAtDesc(
            String phone, String purpose);

    Optional<PhoneVerification> findByVerifiedTokenAndIsVerifiedTrue(String verifiedToken);

    long countByPhoneAndPurposeAndCreatedAtAfter(String phone, String purpose, LocalDateTime after);

    List<PhoneVerification> findByPhoneAndPurposeAndIsVerifiedFalse(String phone, String purpose);
}
