package com.pochak.app.bff.config;

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
                        .title("Pochak App BFF API")
                        .version("1.0.0")
                        .description("모바일 앱용 BFF (Backend For Frontend) API. "
                                + "Identity, Content, Commerce, Operation 서비스를 집약하여 모바일 클라이언트에 최적화된 엔드포인트를 제공합니다."))
                .servers(List.of(
                        new Server().url("http://localhost:9081").description("Local Dev")));
    }
}
