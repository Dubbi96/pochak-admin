package com.pochak.commerce.wallet.dto;

import com.pochak.commerce.wallet.entity.LedgerType;
import com.pochak.commerce.wallet.entity.WalletLedger;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WalletHistoryResponse {

    private Long id;
    private LedgerType ledgerType;
    private Integer amount;
    private Integer balanceAfter;
    private String referenceType;
    private Long referenceId;
    private String description;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public static WalletHistoryResponse from(WalletLedger ledger) {
        return WalletHistoryResponse.builder()
                .id(ledger.getId())
                .ledgerType(ledger.getLedgerType())
                .amount(ledger.getAmount())
                .balanceAfter(ledger.getBalanceAfter())
                .referenceType(ledger.getReferenceType())
                .referenceId(ledger.getReferenceId())
                .description(ledger.getDescription())
                .expiresAt(ledger.getExpiresAt())
                .createdAt(ledger.getCreatedAt())
                .build();
    }
}
