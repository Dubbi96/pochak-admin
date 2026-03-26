package com.pochak.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageMeta {

    private int page;
    private int size;
    private long totalCount;
    private int totalPages;

    /**
     * Creates PageMeta from raw pagination values.
     * Use this to convert Spring Data Page results:
     *   PageMeta.of(page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages())
     */
    public static PageMeta of(int page, int size, long totalCount, int totalPages) {
        return new PageMeta(page, size, totalCount, totalPages);
    }
}
