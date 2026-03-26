package com.pochak.admin.rbac.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.rbac.dto.AdminFunctionResponse;
import com.pochak.admin.rbac.dto.CreateFunctionRequest;
import com.pochak.admin.rbac.dto.UpdateFunctionRequest;
import com.pochak.admin.rbac.entity.AdminFunction;
import com.pochak.admin.rbac.repository.AdminFunctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminFunctionService {

    private final AdminFunctionRepository adminFunctionRepository;
    private final AuditLogService auditLogService;

    public List<AdminFunctionResponse> getActiveFunctions() {
        return adminFunctionRepository.findByIsActiveTrue().stream()
                .map(AdminFunctionResponse::from)
                .collect(Collectors.toList());
    }

    public AdminFunction getFunction(Long id) {
        return adminFunctionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Function not found: " + id));
    }

    public AdminFunctionResponse getFunctionDetail(Long id) {
        return AdminFunctionResponse.from(getFunction(id));
    }

    @Transactional
    public AdminFunctionResponse createFunction(CreateFunctionRequest request) {
        AdminFunction function = AdminFunction.builder()
                .functionCode(request.getFunctionCode())
                .functionName(request.getFunctionName())
                .httpMethod(request.getHttpMethod())
                .apiPath(request.getApiPath())
                .description(request.getDescription())
                .build();

        AdminFunction saved = adminFunctionRepository.save(function);
        AdminFunctionResponse response = AdminFunctionResponse.from(saved);

        auditLogService.log("CREATE", "AdminFunction", saved.getId().toString(), null, response);

        return response;
    }

    @Transactional
    public AdminFunctionResponse updateFunction(Long id, UpdateFunctionRequest request) {
        AdminFunction function = getFunction(id);
        AdminFunctionResponse before = AdminFunctionResponse.from(function);

        function.updateInfo(request.getFunctionName(), request.getHttpMethod(), request.getApiPath(), request.getDescription());
        AdminFunction saved = adminFunctionRepository.save(function);
        AdminFunctionResponse after = AdminFunctionResponse.from(saved);

        auditLogService.log("UPDATE", "AdminFunction", id.toString(), before, after);

        return after;
    }

    @Transactional
    public void deleteFunction(Long id) {
        AdminFunction function = getFunction(id);
        AdminFunctionResponse before = AdminFunctionResponse.from(function);

        function.deactivate();
        adminFunctionRepository.save(function);

        auditLogService.log("DELETE", "AdminFunction", id.toString(), before, null);
    }
}
