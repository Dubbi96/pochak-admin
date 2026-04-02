package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.AdminFunctionResponse;
import com.pochak.admin.rbac.dto.CreateFunctionRequest;
import com.pochak.admin.rbac.service.AdminFunctionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminFunctionControllerTest {

    @InjectMocks
    private AdminFunctionController adminFunctionController;

    @Mock
    private AdminFunctionService adminFunctionService;

    private AdminFunctionResponse sampleFunction() {
        return AdminFunctionResponse.builder()
                .id(1L)
                .functionCode("USER_VIEW")
                .functionName("회원 조회")
                .httpMethod("GET")
                .apiPath("/admin/api/v1/rbac/members")
                .description("회원 목록 조회 권한")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/functions")
    class GetFunctions {

        @Test
        @DisplayName("Should return 200 with function list")
        void getFunctions_success() {
            given(adminFunctionService.getActiveFunctions()).willReturn(List.of(sampleFunction()));

            ResponseEntity<ApiResponse<List<AdminFunctionResponse>>> response = adminFunctionController.getFunctions();

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).hasSize(1);
            assertThat(response.getBody().getData().get(0).getFunctionCode()).isEqualTo("USER_VIEW");
        }

        @Test
        @DisplayName("Should return 200 with empty list when no functions")
        void getFunctions_empty() {
            given(adminFunctionService.getActiveFunctions()).willReturn(Collections.emptyList());

            ResponseEntity<ApiResponse<List<AdminFunctionResponse>>> response = adminFunctionController.getFunctions();

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).isEmpty();
        }
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/functions/{id}")
    class GetFunction {

        @Test
        @DisplayName("Should return 200 with function detail")
        void getFunction_success() {
            given(adminFunctionService.getFunctionDetail(1L)).willReturn(sampleFunction());

            ResponseEntity<ApiResponse<AdminFunctionResponse>> response = adminFunctionController.getFunction(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData().getHttpMethod()).isEqualTo("GET");
            assertThat(response.getBody().getData().getApiPath()).isEqualTo("/admin/api/v1/rbac/members");
        }

        @Test
        @DisplayName("Should propagate exception when function not found")
        void getFunction_notFound() {
            given(adminFunctionService.getFunctionDetail(999L))
                    .willThrow(new IllegalArgumentException("Function not found"));

            assertThatThrownBy(() -> adminFunctionController.getFunction(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Function not found");
        }
    }

    @Nested
    @DisplayName("POST /admin/api/v1/rbac/functions")
    class CreateFunction {

        @Test
        @DisplayName("Should return 201 with created function")
        void createFunction_success() {
            CreateFunctionRequest request = CreateFunctionRequest.builder()
                    .functionCode("CONTENT_EDIT")
                    .functionName("콘텐츠 수정")
                    .httpMethod("PUT")
                    .apiPath("/admin/api/v1/contents/{id}")
                    .description("콘텐츠 수정 권한")
                    .build();

            AdminFunctionResponse created = AdminFunctionResponse.builder()
                    .id(2L)
                    .functionCode("CONTENT_EDIT")
                    .functionName("콘텐츠 수정")
                    .httpMethod("PUT")
                    .apiPath("/admin/api/v1/contents/{id}")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            given(adminFunctionService.createFunction(any(CreateFunctionRequest.class))).willReturn(created);

            ResponseEntity<ApiResponse<AdminFunctionResponse>> response = adminFunctionController.createFunction(request);

            assertThat(response.getStatusCode().value()).isEqualTo(201);
            assertThat(response.getBody().getData().getFunctionCode()).isEqualTo("CONTENT_EDIT");
        }
    }

    @Nested
    @DisplayName("DELETE /admin/api/v1/rbac/functions/{id}")
    class DeleteFunction {

        @Test
        @DisplayName("Should return 200 on successful deletion")
        void deleteFunction_success() {
            doNothing().when(adminFunctionService).deleteFunction(1L);

            ResponseEntity<ApiResponse<Void>> response = adminFunctionController.deleteFunction(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(adminFunctionService).deleteFunction(1L);
        }
    }
}
