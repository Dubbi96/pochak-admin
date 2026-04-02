package com.pochak.identity.user.repository;

import com.pochak.identity.user.entity.UserStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStatusHistoryRepository extends JpaRepository<UserStatusHistory, Long> {

    Optional<UserStatusHistory> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}
