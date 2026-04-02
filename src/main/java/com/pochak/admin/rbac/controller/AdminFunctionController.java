package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.AdminFunctionResponse;
import com.pochak.admin.rbac.dto.CreateFunctionRequest;
import com.pochak.admin.rbac.dto.UpdateFunctionRequest;
import com.pochak.admin.rbac.service.AdminFunctionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/admin/api/v1/rbac/functions")
@RequiredArgsConstructor
public class AdminFunctionController {

    private final AdminFunctionService adminFunctionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminFunctionResponse>>> getFunctions() {
        return ResponseEntity.ok(ApiResponse.ok(adminFunctionService.getActiveFunctions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminFunctionResponse>> getFunction(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminFunctionService.getFunctionDetail(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminFunctionResponse>> createFunction(
            @Valid @RequestBody CreateFunctionRequest request) {
        AdminFunctionResponse function = adminFunctionService.createFunction(request);
        return ResponseEntity
                .created(URI.create("/admin/api/v1/rbac/functions/" + function.getId()))
                .body(ApiResponse.ok(function, "Function created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminFunctionResponse>> updateFunction(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFunctionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminFunctionService.updateFunction(id, request), "Function updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFunction(@PathVariable Long id) {
        adminFunctionService.deleteFunction(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
