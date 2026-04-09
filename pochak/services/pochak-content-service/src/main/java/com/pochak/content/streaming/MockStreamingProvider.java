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
import java.util.Map;

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
     * Sport-specific public test HLS streams, keyed by sport code.
     * These are freely available streams used for development and QA only.
     *
     * Sport codes match content.sports.code in the database (see V100 seed).
     */
    private static final Map<String, String> SPORT_HLS_URLS = Map.of(
            "SOCCER",     "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            "BASKETBALL", "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8",
            "BASEBALL",   "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
            "VOLLEYBALL", "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
            "FUTSAL",     "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8"
    );

    /** Ordered fallback list when contentType is live/vod/clip (no sport info). */
    private static final List<String> FALLBACK_HLS_URLS = List.copyOf(SPORT_HLS_URLS.values());

    @Override
    public StreamInfo getStreamUrl(Long contentId, String contentType) {
        // If contentType is a sport code, return the sport-specific stream.
        String url = SPORT_HLS_URLS.get(contentType == null ? null : contentType.toUpperCase());
        if (url == null) {
            // Fallback: rotate by contentId hash (covers live / vod / clip paths).
            int index = Math.abs(Long.hashCode(contentId)) % FALLBACK_HLS_URLS.size();
            url = FALLBACK_HLS_URLS.get(index);
        }
        return StreamInfo.builder()
                .url(url)
                .protocol("HLS")
                .drmConfig(DrmConfig.builder()
                        .type("NONE")
                        .build())
                .build();
    }

    @Override
    public List<CameraView> getAvailableCameras(Long matchId) {
        int baseIndex = Math.abs(Long.hashCode(matchId)) % FALLBACK_HLS_URLS.size();
        return List.of(
                CameraView.builder()
                        .id(1L)
                        .label("AI")
                        .streamUrl(FALLBACK_HLS_URLS.get(baseIndex))
                        .isDefault(true)
                        .build(),
                CameraView.builder()
                        .id(2L)
                        .label("PANO")
                        .streamUrl(FALLBACK_HLS_URLS.get((baseIndex + 1) % FALLBACK_HLS_URLS.size()))
                        .isDefault(false)
                        .build(),
                CameraView.builder()
                        .id(3L)
                        .label("SIDE_A")
                        .streamUrl(FALLBACK_HLS_URLS.get((baseIndex + 2) % FALLBACK_HLS_URLS.size()))
                        .isDefault(false)
                        .build(),
                CameraView.builder()
                        .id(4L)
                        .label("CAM")
                        .streamUrl(FALLBACK_HLS_URLS.get((baseIndex + 3) % FALLBACK_HLS_URLS.size()))
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
