package com.pochak.admin.cs.dto;

import com.pochak.admin.cs.entity.Inquiry;
import com.pochak.admin.cs.entity.InquiryAnswer;

import java.time.LocalDateTime;

public record InquiryResponse(
        Long id,
        Long userId,
        String username,
        String category,
        String title,
        String content,
        String status,
        String adminReply,
        LocalDateTime repliedAt,
        LocalDateTime createdAt
) {
    public static InquiryResponse from(Inquiry inquiry, InquiryAnswer answer) {
        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getUserId(),
                "user#" + inquiry.getUserId(),
                inquiry.getCategory(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getStatus(),
                answer != null ? answer.getContent() : null,
                answer != null ? answer.getCreatedAt() : null,
                inquiry.getCreatedAt()
        );
    }
}
