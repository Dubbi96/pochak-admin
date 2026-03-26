package com.pochak.commerce.wallet.repository;

import com.pochak.commerce.wallet.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.userId = :userId")
    Optional<Wallet> findByUserIdForUpdate(@Param("userId") Long userId);

    /**
     * DATA-001: Zero out wallet balance for a withdrawn user.
     */
    @Modifying
    @Query("UPDATE Wallet w SET w.balance = 0 WHERE w.userId = :userId")
    int zeroBalanceByUserId(@Param("userId") Long userId);
}
