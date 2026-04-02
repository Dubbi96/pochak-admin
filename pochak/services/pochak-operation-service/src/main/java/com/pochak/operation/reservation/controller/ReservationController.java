package com.pochak.operation.reservation.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.operation.reservation.dto.*;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReservationResponse> createReservation(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateReservationRequest request) {
        return ApiResponse.success(reservationService.createReservation(userId, request));
    }

    @GetMapping
    public ApiResponse<List<ReservationResponse>> getReservations(
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) ReservationStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) Long reservedByUserId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ReservationResponse> page = reservationService.getReservations(
                venueId, status, reservedByUserId, dateFrom, dateTo, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/{id}")
    public ApiResponse<ReservationResponse> getReservation(@PathVariable Long id) {
        return ApiResponse.success(reservationService.getReservation(id));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<ReservationResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeStatusRequest request) {
        return ApiResponse.success(reservationService.changeStatus(id, request));
    }

    @GetMapping("/calendar")
    public ApiResponse<List<CalendarEventResponse>> getCalendarView(
            @RequestParam(defaultValue = "month") String mode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long venueId) {
        return ApiResponse.success(reservationService.getCalendarView(mode, date, venueId));
    }
}
