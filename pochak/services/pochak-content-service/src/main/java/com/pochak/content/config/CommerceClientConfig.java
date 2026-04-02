package com.pochak.content.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class CommerceClientConfig {

    @Value("${pochak.services.commerce.base-url:http://localhost:8083}")
    private String baseUrl;

    @Value("${pochak.services.commerce.connect-timeout:2000}")
    private int connectTimeout;

    @Value("${pochak.services.commerce.read-timeout:3000}")
    private int readTimeout;

    @Bean
    public RestClient commerceRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
