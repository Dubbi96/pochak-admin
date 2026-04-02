package com.pochak.identity.guardian.repository;

import com.pochak.identity.guardian.entity.GuardianRelationship;
import com.pochak.identity.guardian.entity.GuardianRelationship.GuardianStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuardianRelationshipRepository extends JpaRepository<GuardianRelationship, Long> {

    List<GuardianRelationship> findByGuardianIdAndStatusNot(Long guardianId, GuardianStatus status);

    Optional<GuardianRelationship> findByMinorIdAndStatus(Long minorId, GuardianStatus status);

    Optional<GuardianRelationship> findByGuardianIdAndMinorId(Long guardianId, Long minorId);

    boolean existsByGuardianIdAndMinorIdAndStatusNot(Long guardianId, Long minorId, GuardianStatus status);
}
