package com.pochak.identity.user.repository;

import com.pochak.identity.user.entity.UserPushToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPushTokenRepository extends JpaRepository<UserPushToken, Long> {

    List<UserPushToken> findByUser_Id(Long userId);

    Optional<UserPushToken> findByPushToken(String pushToken);

    void deleteByPushToken(String pushToken);
}
