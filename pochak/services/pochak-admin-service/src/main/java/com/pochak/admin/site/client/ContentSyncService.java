package com.pochak.admin.site.client;

import com.pochak.admin.site.entity.Banner;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Syncs admin site content (banners) to the content service's display sections,
 * so the consumer-facing home page reflects BO admin changes.
 */
@Slf4j
@Service
public class ContentSyncService {

    private final RestTemplate restTemplate;
    private final String contentServiceUrl;

    public ContentSyncService(
            RestTemplate adminRestTemplate,
            @Value("${services.content-url:http://localhost:8082}") String contentServiceUrl) {
        this.restTemplate = adminRestTemplate;
        this.contentServiceUrl = contentServiceUrl;
    }

    public void syncBannerToContent(Banner banner) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("title", banner.getTitle());
            body.put("imageUrl", banner.getImageUrl() != null ? banner.getImageUrl() : "");
            body.put("sortOrder", banner.getSortOrder() != null ? banner.getSortOrder() : 0);

            restTemplate.postForObject(
                    contentServiceUrl + "/internal/admin/display-sections/banner",
                    body,
                    Map.class
            );
            log.info("Synced banner '{}' (id={}) to content service", banner.getTitle(), banner.getId());
        } catch (RestClientException e) {
            log.warn("Failed to sync banner '{}' to content service: {}", banner.getTitle(), e.getMessage());
        }
    }
}
