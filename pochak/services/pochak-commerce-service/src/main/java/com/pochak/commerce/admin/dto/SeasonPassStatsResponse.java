package com.pochak.commerce.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SeasonPassStatsResponse(
        LocalDate from,
        LocalDate to,
        Long totalSales,
        BigDecimal totalRevenue
) {}
