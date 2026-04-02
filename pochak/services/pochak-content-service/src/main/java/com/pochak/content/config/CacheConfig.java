package com.pochak.content.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * SEC-009: TTL-based cache configuration using Caffeine.
 * Replaces SimpleCacheManager (ConcurrentMapCache with no TTL) to prevent ABAC cache staleness.
 * Migration path: Replace CaffeineCacheManager with RedisCacheManager
 * when Redis is wired in a future phase.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("home", "schedule", "trending-search", "acl");
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(1000)
                .recordStats());
        return manager;
    }
}
