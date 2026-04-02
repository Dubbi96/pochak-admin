package com.pochak.identity.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminMemberListResponse {
    private List<AdminMemberResponse> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
}
