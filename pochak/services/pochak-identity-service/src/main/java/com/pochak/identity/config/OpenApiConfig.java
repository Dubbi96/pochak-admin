package com.pochak.identity.config;

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
                        .title("Pochak Identity API")
                        .version("1.0.0")
                        .description("인증/인가 서비스. 회원가입(국내/미성년/소셜/외국인), 로그인, OAuth2 PKCE, "
                                + "프로필 관리, 보호자 관리, 푸시 토큰 관리를 담당합니다."))
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Local Dev")));
    }
}
