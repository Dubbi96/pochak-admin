package com.pochak.admin.cs.dto;

public record CreateFaqRequest(
        String category,
        String question,
        String answer,
        Integer sortOrder
) {}
