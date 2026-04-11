package com.pochak.bo.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
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
            throw e;
        }
    }

    // --- Banners ---
    public JsonNode getBanners(Map<String, String> params) {
        try {
            return adminClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/admin/api/v1/site/banners");
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service banners call failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode createBanner(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/site/banners")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateBanner(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/site/banners/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteBanner(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/site/banners/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    // --- Notices ---
    public JsonNode getNotices(Map<String, String> params) {
        try {
            return adminClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/admin/api/v1/site/notices");
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service notices call failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode createNotice(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/site/notices")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateNotice(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/site/notices/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteNotice(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/site/notices/{id}", id)
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
            throw e;
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
            throw e;
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
            throw e;
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
            throw e;
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

    public JsonNode getRole(Long id) {
        return adminClient.get()
                .uri("/admin/api/v1/rbac/roles/{id}", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode putRoleMenus(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/rbac/roles/{id}/menus", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode putRoleFunctions(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/rbac/roles/{id}/functions", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getGroup(Long id) {
        return adminClient.get()
                .uri("/admin/api/v1/rbac/groups/{id}", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode postGroupMembers(Long id, Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/rbac/groups/{id}/members", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteGroupMembers(Long id, Map<String, Object> body) {
        adminClient.method(HttpMethod.DELETE)
                .uri("/admin/api/v1/rbac/groups/{id}/members", id)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    public JsonNode postGroupRoles(Long id, Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/rbac/groups/{id}/roles", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteGroupRoles(Long id, Map<String, Object> body) {
        adminClient.method(HttpMethod.DELETE)
                .uri("/admin/api/v1/rbac/groups/{id}/roles", id)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    public JsonNode getGroupMembers(Long id) {
        return adminClient.get()
                .uri("/admin/api/v1/rbac/groups/{id}/members", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getGroupRoles(Long id) {
        return adminClient.get()
                .uri("/admin/api/v1/rbac/groups/{id}/roles", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getGroupPermissions(Long id) {
        return adminClient.get()
                .uri("/admin/api/v1/rbac/groups/{id}/permissions", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getMenu(Long id) {
        return adminClient.get()
                .uri("/admin/api/v1/rbac/menus/{id}", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode createMenu(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/rbac/menus")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateMenu(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/rbac/menus/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteMenu(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/rbac/menus/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    public JsonNode reorderMenus(Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/rbac/menus/reorder")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getFunction(Long id) {
        return adminClient.get()
                .uri("/admin/api/v1/rbac/functions/{id}", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode createFunction(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/rbac/functions")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateFunction(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/rbac/functions/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteFunction(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/rbac/functions/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    public JsonNode getRbacMembers(Map<String, String> params) {
        return adminClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/admin/api/v1/rbac/members");
                    params.forEach(builder::queryParam);
                    return builder.build();
                })
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getRbacMember(Long id) {
        return adminClient.get()
                .uri("/admin/api/v1/rbac/members/{id}", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode createRbacMember(Map<String, Object> body) {
        return adminClient.post()
                .uri("/admin/api/v1/rbac/members")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateRbacMember(Long id, Map<String, Object> body) {
        return adminClient.put()
                .uri("/admin/api/v1/rbac/members/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteRbacMember(Long id) {
        adminClient.delete()
                .uri("/admin/api/v1/rbac/members/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    public JsonNode patchBlockRbacMember(Long id) {
        return adminClient.patch()
                .uri("/admin/api/v1/rbac/members/{id}/block", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode patchUnblockRbacMember(Long id) {
        return adminClient.patch()
                .uri("/admin/api/v1/rbac/members/{id}/unblock", id)
                .retrieve()
                .body(JsonNode.class);
    }
}
