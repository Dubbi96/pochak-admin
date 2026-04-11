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
public class IdentityServiceClient {

    private final RestClient identityClient;

    public JsonNode getMemberStats() {
        try {
            return identityClient.get()
                    .uri("/admin/members/stats")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Identity service member stats call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getMembers(Map<String, String> params) {
        try {
            return identityClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/admin/members");
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Identity service members call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getMember(Long memberId) {
        try {
            return identityClient.get()
                    .uri("/admin/members/{id}", memberId)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Identity service member detail call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode updateMemberStatus(Long memberId, Map<String, Object> body) {
        return identityClient.put()
                .uri("/admin/members/{id}/status", memberId)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }
}
