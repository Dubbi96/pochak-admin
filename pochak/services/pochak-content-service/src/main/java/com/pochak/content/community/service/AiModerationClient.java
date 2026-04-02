package com.pochak.content.community.service;

import com.pochak.content.community.entity.ReportCategory;

import java.util.List;

/**
 * Interface for AI-based content moderation.
 * External implementations can call moderation APIs (OpenAI, Perspective, etc.).
 */
public interface AiModerationClient {

    ModerationResult analyze(String title, String body);

    record ModerationResult(double toxicityScore, List<ReportCategory> categories, String summary) {}
}
