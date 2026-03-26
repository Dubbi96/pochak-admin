package com.pochak.identity.user.repository;

import com.pochak.identity.user.entity.UserAuthAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAuthAccountRepository extends JpaRepository<UserAuthAccount, Long> {

    Optional<UserAuthAccount> findByProviderAndProviderUserId(String provider, String providerUserId);

    boolean existsByProviderAndProviderUserId(String provider, String providerUserId);

    java.util.List<UserAuthAccount> findAllByUser(com.pochak.identity.user.entity.User user);
}
