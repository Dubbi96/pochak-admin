package com.pochak.commerce.refund.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.refund.dto.ProcessRefundRequest;
import com.pochak.commerce.refund.dto.RefundRequest;
import com.pochak.commerce.refund.dto.RefundResponse;
import com.pochak.commerce.refund.entity.RefundStatus;
import com.pochak.commerce.refund.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    public ResponseEntity<ApiResponse<RefundResponse>> createRefund(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody RefundRequest request) {
        RefundResponse response = refundService.createRefund(userId, request);
        return ResponseEntity.created(URI.create("/refunds/" + response.getId()))
                .body(ApiResponse.ok(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RefundResponse>>> getRefunds(
            @RequestParam(required = false) RefundStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(refundService.getRefunds(status, pageable)));
    }

    @PutMapping("/{id}/process")
    public ResponseEntity<ApiResponse<RefundResponse>> processRefund(
            @PathVariable Long id,
            @Valid @RequestBody ProcessRefundRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(refundService.processRefund(id, request)));
    }
}
