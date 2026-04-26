package com.pochak.partner.bff.config;

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
                        .title("Pochak Partner BFF API")
                        .version("1.0.0")
                        .description("파트너(시설 운영자)용 BFF API. "
                                + "장소 관리, 상품 등록, 예약 승인, 매출 통계 등 파트너 전용 엔드포인트를 제공합니다."))
                .servers(List.of(
                        new Server().url("http://localhost:9091").description("Local Dev")));
    }

    @Bean
    public GroupedOpenApi partnerVenueApi() {
        return GroupedOpenApi.builder()
                .group("partner-venue")
                .displayName("Partner Venue & Product API")
                .pathsToMatch("/api/v1/partner/venues/**", "/api/v1/partner/reservations/**")
                .build();
    }

    @Bean
    public GroupedOpenApi partnerFinanceApi() {
        return GroupedOpenApi.builder()
                .group("partner-finance")
                .displayName("Partner Finance & Settlement API")
                .pathsToMatch("/api/v1/partner/settlements/**", "/api/v1/partner/analytics/**")
                .build();
    }

    @Bean
    public GroupedOpenApi partnerContentApi() {
        return GroupedOpenApi.builder()
                .group("partner-content")
                .displayName("Partner Content API")
                .pathsToMatch("/api/v1/partner/partners/**", "/api/v1/partner/notices/**")
                .build();
    }
}
