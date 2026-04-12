package com.pochak.commerce.settlement.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.settlement.entity.PartnerBalance;
import com.pochak.commerce.settlement.entity.PartnerSettlement;
import com.pochak.commerce.settlement.repository.PartnerBalanceRepository;
import com.pochak.commerce.settlement.repository.PartnerSettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/partner")
@RequiredArgsConstructor
public class PartnerSettlementController {

    private final PartnerBalanceRepository balanceRepository;
    private final PartnerSettlementRepository settlementRepository;

    @GetMapping("/balances")
    public ResponseEntity<ApiResponse<PartnerBalance>> getBalance(
            @RequestHeader("X-User-Id") Long partnerId) {
        PartnerBalance balance = balanceRepository.findByPartnerId(partnerId)
                .orElse(PartnerBalance.builder().partnerId(partnerId).build());
        return ResponseEntity.ok(ApiResponse.ok(balance));
    }

    @GetMapping("/settlements")
    public ResponseEntity<ApiResponse<Page<PartnerSettlement>>> getSettlements(
            @RequestHeader("X-User-Id") Long partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PartnerSettlement> settlements = settlementRepository
                .findByPartnerIdOrderByCreatedAtDesc(partnerId,
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(settlements));
    }

    @PatchMapping("/settlements/{settlementId}/confirm")
    public ResponseEntity<ApiResponse<PartnerSettlement>> confirmSettlement(
            @RequestHeader("X-User-Id") Long partnerId,
            @PathVariable Long settlementId) {
        PartnerSettlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("Settlement not found: " + settlementId));
        if (!settlement.getPartnerId().equals(partnerId)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Not your settlement"));
        }
        settlement.confirm();
        settlementRepository.save(settlement);
        return ResponseEntity.ok(ApiResponse.ok(settlement));
    }
}
