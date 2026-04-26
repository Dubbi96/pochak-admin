package com.pochak.operation.reservation.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.operation.reservation.dto.AdminChangeStatusRequest;
import com.pochak.operation.reservation.dto.ReservationResponse;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/reservations")
@RequiredArgsConstructor
public class ReservationAdminController {

    private final ReservationService reservationService;

    @GetMapping
    public ApiResponse<List<ReservationResponse>> getReservations(
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ReservationResponse> page = reservationService.getAdminReservations(status, venueId, date, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ReservationResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminChangeStatusRequest request) {
        return ApiResponse.success(reservationService.adminChangeStatus(id, request));
    }
}
