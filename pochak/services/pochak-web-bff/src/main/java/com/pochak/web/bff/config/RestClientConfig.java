package com.pochak.web.bff.config;

import com.pochak.common.constant.HeaderConstants;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${pochak.services.identity-url}")
    private String identityUrl;

    @Value("${pochak.services.content-url}")
    private String contentUrl;

    @Value("${pochak.services.commerce-url}")
    private String commerceUrl;

    @Value("${pochak.services.admin-url}")
    private String adminUrl;

    private ClientHttpRequestInterceptor correlationIdInterceptor() {
        return (request, body, execution) -> {
            String correlationId = MDC.get("correlationId");
            if (correlationId != null) {
                request.getHeaders().set(HeaderConstants.X_CORRELATION_ID, correlationId);
            }
            return execution.execute(request, body);
        };
    }

    @Bean
    public RestClient identityClient() {
        return RestClient.builder()
                .baseUrl(identityUrl)
                .requestInterceptor(correlationIdInterceptor())
                .build();
    }

    @Bean
    public RestClient contentClient() {
        return RestClient.builder()
                .baseUrl(contentUrl)
                .requestInterceptor(correlationIdInterceptor())
                .build();
    }

    @Bean
    public RestClient commerceClient() {
        return RestClient.builder()
                .baseUrl(commerceUrl)
                .requestInterceptor(correlationIdInterceptor())
                .build();
    }

    @Bean
    public RestClient adminClient() {
        return RestClient.builder()
                .baseUrl(adminUrl)
                .requestInterceptor(correlationIdInterceptor())
                .build();
    }
}
