package com.pochak.commerce.config;

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
                        .title("Pochak Commerce API")
                        .version("1.0.0")
                        .description("커머스 서비스. 상품, 구매/결제, 쿠폰, 지갑/포인트, "
                                + "시청 권한(Entitlement), 환불을 담당합니다."))
                .servers(List.of(
                        new Server().url("http://localhost:8083").description("Local Dev")));
    }
}
