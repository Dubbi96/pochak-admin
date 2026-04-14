package com.pochak.admin.common;

import org.springframework.data.domain.Page;

import java.util.List;

public record AdminPageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static <T> AdminPageResponse<T> from(Page<T> springPage) {
        return new AdminPageResponse<>(
                springPage.getContent(),
                springPage.getNumber(),
                springPage.getSize(),
                springPage.getTotalElements(),
                springPage.getTotalPages()
        );
    }
}
