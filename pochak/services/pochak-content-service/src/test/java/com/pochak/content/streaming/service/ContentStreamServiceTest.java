package com.pochak.content.streaming.service;

import com.pochak.content.streaming.MockStreamingProvider;
import com.pochak.content.streaming.StreamingProvider;
import com.pochak.content.streaming.dto.PlaybackResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for ContentStreamService.
 * Uses the real MockStreamingProvider to verify end-to-end wiring
 * and cross-platform consistency.
 */
@ExtendWith(MockitoExtension.class)
class ContentStreamServiceTest {

    private StreamingProvider streamingProvider;
    private ContentStreamService contentStreamService;

    @BeforeEach
    void setUp() {
        streamingProvider = new MockStreamingProvider();
        contentStreamService = new ContentStreamService(streamingProvider);
    }

    @Test
    @DisplayName("Should return live playback with camera views")
    void testGetPlaybackInfo_live() {
        PlaybackResponse response = contentStreamService.getPlaybackInfo("live", 100L);

        assertThat(response).isNotNull();
        assertThat(response.getStreamUrl()).isNotBlank();
        assertThat(response.getProtocol()).isEqualTo("hls");
        assertThat(response.isLive()).isTrue();
        assertThat(response.getDurationSeconds()).isNull();
        assertThat(response.getCameraViews()).isNotEmpty();
        assertThat(response.getQualityLevels()).isNotEmpty();
    }

    @Test
    @DisplayName("Should return VOD playback without camera views")
    void testGetPlaybackInfo_vod() {
        PlaybackResponse response = contentStreamService.getPlaybackInfo("vod", 200L);

        assertThat(response).isNotNull();
        assertThat(response.getStreamUrl()).isNotBlank();
        assertThat(response.getProtocol()).isEqualTo("hls");
        assertThat(response.isLive()).isFalse();
        assertThat(response.getDurationSeconds()).isNotNull();
        assertThat(response.getCameraViews()).isEmpty();
        assertThat(response.getQualityLevels()).isNotEmpty();
    }

    @Test
    @DisplayName("Should return clip playback with short duration")
    void testGetPlaybackInfo_clip() {
        PlaybackResponse response = contentStreamService.getPlaybackInfo("clip", 300L);

        assertThat(response).isNotNull();
        assertThat(response.isLive()).isFalse();
        assertThat(response.getDurationSeconds()).isEqualTo(120L);
        assertThat(response.getCameraViews()).isEmpty();
    }

    @Test
    @DisplayName("Same contentId returns same stream URL regardless of caller (cross-platform consistency)")
    void testCrossPlatformConsistency() {
        Long contentId = 42L;

        // Simulate mobile call
        PlaybackResponse mobileResponse = contentStreamService.getPlaybackInfo("vod", contentId);
        // Simulate web call (same service, same endpoint)
        PlaybackResponse webResponse = contentStreamService.getPlaybackInfo("vod", contentId);

        assertThat(mobileResponse.getStreamUrl())
                .as("Mobile and web must receive the same stream URL for the same contentId")
                .isEqualTo(webResponse.getStreamUrl());

        assertThat(mobileResponse.getProtocol()).isEqualTo(webResponse.getProtocol());
        assertThat(mobileResponse.getQualityLevels()).hasSameSizeAs(webResponse.getQualityLevels());
    }

    @Test
    @DisplayName("Different contentIds may produce different stream URLs (rotation)")
    void testStreamUrlRotation() {
        PlaybackResponse r1 = contentStreamService.getPlaybackInfo("vod", 1L);
        PlaybackResponse r2 = contentStreamService.getPlaybackInfo("vod", 2L);
        PlaybackResponse r3 = contentStreamService.getPlaybackInfo("vod", 3L);

        // At least two different URLs across three contentIds
        boolean hasDifferentUrls = !r1.getStreamUrl().equals(r2.getStreamUrl())
                || !r2.getStreamUrl().equals(r3.getStreamUrl());
        assertThat(hasDifferentUrls)
                .as("MockStreamingProvider should rotate between different test HLS URLs")
                .isTrue();
    }
}
