package com.pochak.gateway.config;

import com.pochak.gateway.filter.RateLimitFilter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Periodically evicts stale rate-limit buckets to prevent memory growth.
 * Only active when in-memory rate limiting is used (Redis handles TTL automatically).
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "pochak.rate-limit.type", havingValue = "in-memory")
public class RateLimitCleanupConfig {

    private final RateLimitFilter rateLimitFilter;

    public RateLimitCleanupConfig(RateLimitFilter rateLimitFilter) {
        this.rateLimitFilter = rateLimitFilter;
    }

    @Scheduled(fixedRate = 300_000) // every 5 minutes
    public void cleanupStaleBuckets() {
        rateLimitFilter.evictStaleBuckets();
    }
}
