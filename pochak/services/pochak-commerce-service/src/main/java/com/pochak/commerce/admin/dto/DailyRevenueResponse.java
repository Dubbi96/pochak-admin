package com.pochak.commerce.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DailyRevenueResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal totalRevenue,
        List<DailyEntry> daily
) {
    public record DailyEntry(LocalDate date, BigDecimal revenue, Long count) {}
}
