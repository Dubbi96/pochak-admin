package com.pochak.admin.club.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RestAdminClubContentClient implements AdminClubContentClient {

    private final RestTemplate adminRestTemplate;

    @Value("${services.content-url:http://localhost:8082}")
    private String contentUrl;

    @Override
    public JsonNode listClubs(Map<String, String> params) {
        try {
            UriComponentsBuilder uri = UriComponentsBuilder
                    .fromHttpUrl(contentUrl + "/clubs");
            params.forEach(uri::queryParam);
            ResponseEntity<JsonNode> resp = adminRestTemplate.getForEntity(
                    uri.toUriString(), JsonNode.class);
            return resp.getBody();
        } catch (RestClientException e) {
            log.warn("Content service listClubs failed: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public JsonNode getClub(Long clubId) {
        try {
            ResponseEntity<JsonNode> resp = adminRestTemplate.getForEntity(
                    contentUrl + "/clubs/" + clubId, JsonNode.class);
            return resp.getBody();
        } catch (RestClientException e) {
            log.warn("Content service getClub {} failed: {}", clubId, e.getMessage());
            return null;
        }
    }

    @Override
    public JsonNode updateClubStatus(Long clubId, String status) {
        try {
            Map<String, String> body = Map.of("status", status);
            ResponseEntity<JsonNode> resp = adminRestTemplate.postForEntity(
                    contentUrl + "/clubs/" + clubId + "/status", body, JsonNode.class);
            return resp.getBody();
        } catch (RestClientException e) {
            log.warn("Content service updateClubStatus {} failed: {}", clubId, e.getMessage());
            return null;
        }
    }

    @Override
    public JsonNode getClubMembers(Long clubId) {
        try {
            ResponseEntity<JsonNode> resp = adminRestTemplate.getForEntity(
                    contentUrl + "/clubs/" + clubId + "/members", JsonNode.class);
            return resp.getBody();
        } catch (RestClientException e) {
            log.warn("Content service getClubMembers {} failed: {}", clubId, e.getMessage());
            return null;
        }
    }
}
