package com.pochak.commerce.wallet.repository;

import com.pochak.commerce.wallet.entity.LedgerType;
import com.pochak.commerce.wallet.entity.WalletLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface WalletLedgerRepository extends JpaRepository<WalletLedger, Long> {

    Page<WalletLedger> findByWalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);

    @Query("SELECT wl FROM WalletLedger wl WHERE wl.walletId = :walletId " +
            "AND (:ledgerType IS NULL OR wl.ledgerType = :ledgerType) " +
            "AND (:dateFrom IS NULL OR wl.createdAt >= :dateFrom) " +
            "AND (:dateTo IS NULL OR wl.createdAt <= :dateTo) " +
            "ORDER BY wl.createdAt DESC")
    Page<WalletLedger> findWithFilters(
            @Param("walletId") Long walletId,
            @Param("ledgerType") LedgerType ledgerType,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable);
}
