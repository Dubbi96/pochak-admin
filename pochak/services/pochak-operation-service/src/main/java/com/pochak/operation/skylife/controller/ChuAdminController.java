package com.pochak.operation.skylife.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.operation.skylife.dto.ChuRequest;
import com.pochak.operation.skylife.dto.ChuResponse;
import com.pochak.operation.skylife.entity.ChuStatus;
import com.pochak.operation.skylife.service.ChuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/skylife")
@RequiredArgsConstructor
public class ChuAdminController {

    private final ChuService chuService;

    @GetMapping("/chus")
    public ApiResponse<List<ChuResponse>> getChus(
            @RequestParam(required = false) ChuStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ChuResponse> page = chuService.getChus(status, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @PostMapping("/chus")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ChuResponse> registerChu(@Valid @RequestBody ChuRequest request) {
        return ApiResponse.success(chuService.registerChu(request));
    }

    @GetMapping("/chus/{id}")
    public ApiResponse<ChuResponse> getChu(@PathVariable Long id) {
        return ApiResponse.success(chuService.getChu(id));
    }

    @PostMapping("/chus/{id}/connect")
    public ApiResponse<ChuResponse> connect(@PathVariable Long id) {
        return ApiResponse.success(chuService.connect(id));
    }

    @PostMapping("/chus/{id}/disconnect")
    public ApiResponse<ChuResponse> disconnect(@PathVariable Long id) {
        return ApiResponse.success(chuService.disconnect(id));
    }

    @GetMapping("/activation")
    public ApiResponse<List<ChuResponse>> getActivatedChus(
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ChuResponse> page = chuService.getActivatedChus(pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }
}
