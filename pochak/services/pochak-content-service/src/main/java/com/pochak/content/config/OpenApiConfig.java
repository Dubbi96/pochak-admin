package com.pochak.content.config;

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
                        .title("Pochak Content API")
                        .version("1.0.0")
                        .description("콘텐츠 서비스. LIVE/VOD/CLIP 관리, 스포츠 데이터, 팀/선수, "
                                + "검색, 태그, 댓글, 커뮤니티, 알림, 시청 기록, 추천, 하이라이트를 담당합니다."))
                .servers(List.of(
                        new Server().url("http://localhost:8082").description("Local Dev")));
    }
}
