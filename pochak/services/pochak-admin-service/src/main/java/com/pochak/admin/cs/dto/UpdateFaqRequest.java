package com.pochak.admin.cs.dto;

public record UpdateFaqRequest(
        String category,
        String question,
        String answer,
        Integer sortOrder
) {}
