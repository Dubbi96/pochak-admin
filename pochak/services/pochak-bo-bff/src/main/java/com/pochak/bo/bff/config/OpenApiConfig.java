package com.pochak.bo.bff.config;

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
                        .title("Pochak BO BFF API")
                        .version("1.0.0")
                        .description("관리자(Back Office)용 BFF API. "
                                + "전체 도메인 서비스를 집약하여 관리 대시보드에 최적화된 엔드포인트를 제공합니다."))
                .servers(List.of(
                        new Server().url("http://localhost:9090").description("Local Dev")));
    }
}
