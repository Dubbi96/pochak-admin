package com.pochak.commerce.admin.dto;

public record PointsSummaryResponse(
        Long totalUsersWithWallet,
        Long totalIssuedPoints,
        Long totalUsedPoints,
        Long totalRemainingPoints
) {}
