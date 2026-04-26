package com.pochak.identity.session.repository;

import com.pochak.identity.session.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    List<UserSession> findByUserIdAndActiveTrue(Long userId);

    Optional<UserSession> findByRefreshTokenAndActiveTrue(String refreshToken);

    long countByUserIdAndActiveTrue(Long userId);

    @Modifying
    @Query("UPDATE UserSession s SET s.active = false WHERE s.userId = :userId AND s.active = true")
    void deactivateAllByUserId(@Param("userId") Long userId);
}
