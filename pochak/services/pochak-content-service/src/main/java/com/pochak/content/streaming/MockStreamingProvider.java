package com.pochak.content.streaming;

import com.pochak.content.streaming.dto.CameraView;
import com.pochak.content.streaming.dto.DrmConfig;
import com.pochak.content.streaming.dto.QualityLevel;
import com.pochak.content.streaming.dto.StreamInfo;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mock implementation of StreamingProvider.
 * Returns public test HLS streams for development and testing.
 *
 * Activated when pochak.streaming.provider=mock (or not set at all).
 * Replace with 'pixellot' or 'aws-ivs' for production.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "pochak.streaming.provider", havingValue = "mock", matchIfMissing = true)
public class MockStreamingProvider implements StreamingProvider {

    @PostConstruct
    void logStubWarning() {
        log.warn("========================================================");
        log.warn(" Using MOCK streaming provider.");
        log.warn(" Set pochak.streaming.provider for production.");
        log.warn("========================================================");
    }

    /**
     * Public test HLS streams that actually work in any player.
     * Rotated based on contentId hash so different content shows different streams.
     */
    private static final String[] TEST_HLS_URLS = {
            "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8",
            "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
    };

    @Override
    public StreamInfo getStreamUrl(Long contentId, String contentType) {
        int index = Math.abs(Long.hashCode(contentId)) % TEST_HLS_URLS.length;
        return StreamInfo.builder()
                .url(TEST_HLS_URLS[index])
                .protocol("HLS")
                .drmConfig(DrmConfig.builder()
                        .type("NONE")
                        .build())
                .build();
    }

    @Override
    public List<CameraView> getAvailableCameras(Long matchId) {
        // Use the first test URL as base for camera views
        String baseUrl = TEST_HLS_URLS[0];
        return List.of(
                CameraView.builder()
                        .id(1L)
                        .label("AI")
                        .streamUrl(baseUrl)
                        .isDefault(true)
                        .build(),
                CameraView.builder()
                        .id(2L)
                        .label("PANO")
                        .streamUrl(TEST_HLS_URLS[1 % TEST_HLS_URLS.length])
                        .isDefault(false)
                        .build(),
                CameraView.builder()
                        .id(3L)
                        .label("SIDE_A")
                        .streamUrl(TEST_HLS_URLS[2 % TEST_HLS_URLS.length])
                        .isDefault(false)
                        .build(),
                CameraView.builder()
                        .id(4L)
                        .label("CAM")
                        .streamUrl(TEST_HLS_URLS[0])
                        .isDefault(false)
                        .build()
        );
    }

    @Override
    public List<QualityLevel> getQualityLevels(String streamUrl) {
        return List.of(
                QualityLevel.builder()
                        .label("1080p")
                        .bitrate(5000000)
                        .width(1920)
                        .height(1080)
                        .build(),
                QualityLevel.builder()
                        .label("720p")
                        .bitrate(3000000)
                        .width(1280)
                        .height(720)
                        .build(),
                QualityLevel.builder()
                        .label("480p")
                        .bitrate(1500000)
                        .width(854)
                        .height(480)
                        .build(),
                QualityLevel.builder()
                        .label("360p")
                        .bitrate(800000)
                        .width(640)
                        .height(360)
                        .build()
        );
    }
}
