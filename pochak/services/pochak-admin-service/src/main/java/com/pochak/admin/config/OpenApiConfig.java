package com.pochak.admin.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
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
}
