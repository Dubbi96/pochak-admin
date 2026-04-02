package com.pochak.content.community.service;

import com.pochak.content.community.entity.ReportCategory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Stub implementation of AiModerationClient used when AI moderation is not configured.
 * Always returns a safe (non-toxic) result.
 */
@Component
@ConditionalOnProperty(name = "pochak.moderation.ai.enabled", havingValue = "false", matchIfMissing = true)
public class StubAiModerationClient implements AiModerationClient {

    @Override
    public ModerationResult analyze(String title, String body) {
        return new ModerationResult(0.0, List.of(), "AI moderation not configured");
    }
}
