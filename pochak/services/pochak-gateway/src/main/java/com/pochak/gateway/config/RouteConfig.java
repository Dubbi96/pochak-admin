package com.pochak.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    @Value("${services.identity-url:http://localhost:8081}")
    private String identityUrl;

    @Value("${services.content-url:http://localhost:8082}")
    private String contentUrl;

    @Value("${services.commerce-url:http://localhost:8083}")
    private String commerceUrl;

    @Value("${services.operation-url:http://localhost:8084}")
    private String operationUrl;

    @Value("${services.admin-url:http://localhost:8085}")
    private String adminUrl;

    @Value("${services.web-bff-url:http://localhost:9080}")
    private String webBffUrl;

    @Value("${services.bo-bff-url:http://localhost:9081}")
    private String boBffUrl;

    @Value("${services.partner-bff-url:http://localhost:9091}")
    private String partnerBffUrl;

    @Bean
    public RouteLocator pochakRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // 0. partner-bff routes (/api/v1/partners/**, /api/v1/partner/** → partner-bff, no strip)
                .route("partner-bff-service", r -> r
                        .path("/api/v1/partners/**",
                              "/api/v1/partner/**")
                        .uri(partnerBffUrl))
                // 0a. web-bff routes (FIRST - /api/v1/web/** → web-bff, stripPrefix(3))
                .route("web-bff-service", r -> r
                        .path("/api/v1/web/**")
                        .filters(f -> f.stripPrefix(3))
                        .uri(webBffUrl))
                // 1. content-user-routes (FIRST - resolves ISSUE-004 /users/** path conflict)
                .route("content-user-routes", r -> r
                        .path("/api/v1/users/me/watch-history/**",
                              "/api/v1/users/me/favorites/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(contentUrl))
                // 2. identity-service
                .route("identity-service", r -> r
                        .path("/api/v1/auth/**",
                              "/api/v1/users/**",
                              "/api/v1/guardians/**",
                              "/api/v1/admin/members/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(identityUrl))
                // 3. operation-service (BEFORE content - resolves ISSUE-005 streaming/ingest specificity)
                .route("operation-service", r -> r
                        .path("/api/v1/venues/**",
                              "/api/v1/cameras/**",
                              "/api/v1/reservations/**",
                              "/api/v1/streaming/ingest/**",
                              "/api/v1/studio/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(operationUrl))
                // 4. content-service (all content routes including consumer-facing streaming)
                .route("content-service", r -> r
                        .path("/api/v1/contents/**",
                              "/api/v1/sports/**",
                              "/api/v1/teams/**",
                              "/api/v1/competitions/**",
                              "/api/v1/matches/**",
                              "/api/v1/home/**",
                              "/api/v1/clubs/**",
                              "/api/v1/organizations/**",
                              "/api/v1/search/**",
                              "/api/v1/recommendations/**",
                              "/api/v1/upload/**",
                              "/api/v1/follows/**",
                              "/api/v1/memberships/**",
                              "/api/v1/schedule/**",
                              "/api/v1/comments/**",
                              "/api/v1/notifications/**",
                              "/api/v1/streaming/**",
                              "/api/v1/communities/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(contentUrl))
                // 5. commerce-service
                .route("commerce-service", r -> r
                        .path("/api/v1/subscriptions/**",
                              "/api/v1/payments/**",
                              "/api/v1/products/**",
                              "/api/v1/wallet/**",
                              "/api/v1/purchases/**",
                              "/api/v1/refunds/**",
                              "/api/v1/entitlements/**",
                              "/api/v1/coupons/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri(commerceUrl))
                // 6. admin-service (NO stripPrefix)
                .route("admin-service", r -> r
                        .path("/admin/**")
                        .uri(adminUrl))
                .build();
    }
}
