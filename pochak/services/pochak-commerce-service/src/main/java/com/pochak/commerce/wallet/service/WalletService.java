package com.pochak.commerce.wallet.service;

import com.pochak.commerce.wallet.dto.ChargeRequest;
import com.pochak.commerce.wallet.dto.UsePointsRequest;
import com.pochak.commerce.wallet.dto.WalletHistoryResponse;
import com.pochak.commerce.wallet.dto.WalletResponse;
import com.pochak.commerce.wallet.entity.LedgerType;
import com.pochak.commerce.wallet.entity.Wallet;
import com.pochak.commerce.wallet.entity.WalletLedger;
import com.pochak.commerce.wallet.repository.WalletLedgerRepository;
import com.pochak.commerce.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletLedgerRepository walletLedgerRepository;

    @Transactional
    public WalletResponse getWallet(Long userId) {
        Wallet wallet = createWalletIfNotExists(userId);
        return WalletResponse.from(wallet);
    }

    @Transactional
    public Page<WalletHistoryResponse> getWalletHistory(Long userId, LedgerType ledgerType,
                                                         LocalDateTime dateFrom, LocalDateTime dateTo,
                                                         Pageable pageable) {
        Wallet wallet = createWalletIfNotExists(userId);
        return walletLedgerRepository.findWithFilters(wallet.getId(), ledgerType, dateFrom, dateTo, pageable)
                .map(WalletHistoryResponse::from);
    }

    @Transactional
    public Page<WalletHistoryResponse> getWalletHistory(Long userId, Pageable pageable) {
        Wallet wallet = createWalletIfNotExists(userId);
        return walletLedgerRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable)
                .map(WalletHistoryResponse::from);
    }

    @Transactional
    public WalletResponse charge(Long userId, ChargeRequest request) {
        Wallet wallet = getOrCreateWalletForUpdate(userId);
        wallet.addBalance(request.getAmount());

        WalletLedger ledger = WalletLedger.builder()
                .walletId(wallet.getId())
                .ledgerType(LedgerType.CHARGE)
                .amount(request.getAmount())
                .balanceAfter(wallet.getBalance())
                .description("Point charge via " + (request.getPaymentMethod() != null ? request.getPaymentMethod() : "UNKNOWN"))
                .build();
        walletLedgerRepository.save(ledger);

        return WalletResponse.from(wallet);
    }

    @Transactional
    public WalletResponse usePoints(Long userId, UsePointsRequest request) {
        Wallet wallet = getOrCreateWalletForUpdate(userId);
        wallet.deductBalance(request.getAmount());

        WalletLedger ledger = WalletLedger.builder()
                .walletId(wallet.getId())
                .ledgerType(LedgerType.USE)
                .amount(-request.getAmount())
                .balanceAfter(wallet.getBalance())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .description(request.getDescription())
                .build();
        walletLedgerRepository.save(ledger);

        return WalletResponse.from(wallet);
    }

    @Transactional
    public void creditWallet(Long userId, int amount, String referenceType, Long referenceId, String description) {
        Wallet wallet = getOrCreateWalletForUpdate(userId);
        wallet.addBalance(amount);

        WalletLedger ledger = WalletLedger.builder()
                .walletId(wallet.getId())
                .ledgerType(LedgerType.CHARGE)
                .amount(amount)
                .balanceAfter(wallet.getBalance())
                .referenceType(referenceType)
                .referenceId(referenceId)
                .description(description)
                .build();
        walletLedgerRepository.save(ledger);
    }

    @Transactional
    public Wallet createWalletIfNotExists(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(
                        Wallet.builder()
                                .userId(userId)
                                .balance(0)
                                .build()
                ));
    }

    private Wallet getOrCreateWalletForUpdate(Long userId) {
        return walletRepository.findByUserIdForUpdate(userId)
                .orElseGet(() -> walletRepository.save(
                        Wallet.builder()
                                .userId(userId)
                                .balance(0)
                                .build()
                ));
    }
}
