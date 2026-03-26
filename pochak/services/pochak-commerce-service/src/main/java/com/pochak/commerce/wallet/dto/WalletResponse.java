package com.pochak.commerce.wallet.dto;

import com.pochak.commerce.wallet.entity.Wallet;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WalletResponse {

    private Long id;
    private Long userId;
    private Integer balance;

    public static WalletResponse from(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .build();
    }
}
