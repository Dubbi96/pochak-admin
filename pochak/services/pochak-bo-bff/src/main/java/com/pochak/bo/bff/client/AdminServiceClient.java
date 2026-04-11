package com.pochak.bo.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminServiceClient {

    private final RestClient adminClient;

    public JsonNode getDashboardAnalytics() {
        try {
            return adminClient.get()
                    .uri("/admin/api/v1/analytics/dashboard")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service dashboard analytics call failed: {}", e.getMessage());
            return null;
        }
    }

    // --- Banners ---
    public JsonNode getBanners(Map<String, String> params) {
        try {
            return adminClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/admin/api/v1/banners");
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service banners call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode createBanner(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/banners")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateBanner(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/banners/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteBanner(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/banners/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    // --- Notices ---
    public JsonNode getNotices(Map<String, String> params) {
        try {
            return adminClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/admin/api/v1/notices");
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service notices call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode createNotice(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/notices")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateNotice(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/notices/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteNotice(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/notices/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    // --- RBAC ---
    public JsonNode getRoles() {
        try {
            return adminClient.get()
                    .uri("/admin/api/v1/rbac/roles")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service roles call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getGroups() {
        try {
            return adminClient.get()
                    .uri("/admin/api/v1/rbac/groups")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service groups call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getMenus() {
        try {
            return adminClient.get()
                    .uri("/admin/api/v1/rbac/menus")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service menus call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getFunctions() {
        try {
            return adminClient.get()
                    .uri("/admin/api/v1/rbac/functions")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service functions call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode createRole(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/rbac/roles")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateRole(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/rbac/roles/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteRole(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/rbac/roles/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    public JsonNode createGroup(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/rbac/groups")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateGroup(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/rbac/groups/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteGroup(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/rbac/groups/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }
}
