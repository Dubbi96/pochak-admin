package com.pochak.admin.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Pochak Admin API")
                        .version("1.0.0")
                        .description("관리자 서비스. RBAC(역할/사용자/기능/메뉴/그룹), 단체 관리, "
                                + "분석 통계, CS(문의/신고/약관), 사이트 관리(배너/공지), 앱 버전 관리를 담당합니다."))
                .servers(List.of(
                        new Server().url("http://localhost:8085").description("Local Dev")));
    }

    @Bean
    public GroupedOpenApi rbacApi() {
        return GroupedOpenApi.builder()
                .group("admin-rbac")
                .displayName("RBAC & Auth")
                .pathsToMatch("/admin/api/v1/auth/**", "/admin/api/v1/rbac/**")
                .build();
    }

    @Bean
    public GroupedOpenApi siteManagementApi() {
        return GroupedOpenApi.builder()
                .group("admin-site")
                .displayName("Site Management (Banner, Notice, Push, Event, Popup)")
                .pathsToMatch("/admin/api/v1/site/**")
                .build();
    }

    @Bean
    public GroupedOpenApi csApi() {
        return GroupedOpenApi.builder()
                .group("admin-cs")
                .displayName("CS (Inquiries, Reports, Terms)")
                .pathsToMatch("/admin/api/v1/cs/**")
                .build();
    }

    @Bean
    public GroupedOpenApi operationsApi() {
        return GroupedOpenApi.builder()
                .group("admin-operations")
                .displayName("Operations (Analytics, Audit, Organizations, Clubs, App Versions)")
                .pathsToMatch("/admin/api/v1/analytics/**", "/admin/api/v1/audit/**",
                        "/admin/api/v1/organizations/**", "/admin/api/v1/clubs/**",
                        "/admin/api/v1/app/**")
                .build();
    }
}
