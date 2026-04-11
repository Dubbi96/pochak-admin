package com.pochak.partner.bff.config;

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
                        .title("Pochak Partner BFF API")
                        .version("1.0.0")
                        .description("파트너(시설 운영자)용 BFF API. "
                                + "장소 관리, 상품 등록, 예약 승인, 매출 통계 등 파트너 전용 엔드포인트를 제공합니다."))
                .servers(List.of(
                        new Server().url("http://localhost:9091").description("Local Dev")));
    }
}
