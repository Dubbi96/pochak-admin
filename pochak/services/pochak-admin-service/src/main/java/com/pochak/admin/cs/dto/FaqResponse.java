package com.pochak.admin.cs.dto;

import com.pochak.admin.cs.entity.Faq;

import java.time.LocalDateTime;

public record FaqResponse(
        Long id,
        String category,
        String question,
        String answer,
        Integer sortOrder,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static FaqResponse from(Faq faq) {
        return new FaqResponse(
                faq.getId(),
                faq.getCategory(),
                faq.getQuestion(),
                faq.getAnswer(),
                faq.getSortOrder(),
                faq.getActive(),
                faq.getCreatedAt(),
                faq.getUpdatedAt()
        );
    }
}
