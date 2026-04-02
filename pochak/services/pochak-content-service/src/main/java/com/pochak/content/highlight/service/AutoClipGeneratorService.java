package com.pochak.content.highlight.service;

import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.highlight.dto.HighlightResponse;
import com.pochak.content.highlight.entity.Highlight;
import com.pochak.content.highlight.repository.HighlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Generates ClipAsset entries from detected highlights.
 * Each highlight becomes a clip with a +-5 second buffer around the highlight time range.
 *
 * Stub implementation: creates mock clips linked to the source content.
 * In production, this would trigger a transcoding pipeline to actually cut the video.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AutoClipGeneratorService {

    private static final int CLIP_BUFFER_SECONDS = 5;

    private final HighlightRepository highlightRepository;
    private final ClipAssetRepository clipAssetRepository;

    /**
     * Generate clip assets from all detected highlights for a given content.
     * Returns the list of created ClipAsset IDs.
     */
    @Transactional
    public List<Long> generateClipsFromHighlights(Long contentId, String contentType) {
        List<Highlight> highlights = highlightRepository
                .findByContentIdAndContentTypeOrderByStartTimeSecondsAsc(contentId, contentType.toUpperCase());

        if (highlights.isEmpty()) {
            log.info("No highlights found for content {} (type={}), skipping clip generation", contentId, contentType);
            return List.of();
        }

        List<ClipAsset> generatedClips = new ArrayList<>();

        for (int i = 0; i < highlights.size(); i++) {
            Highlight h = highlights.get(i);

            int clipStart = Math.max(0, h.getStartTimeSeconds() - CLIP_BUFFER_SECONDS);
            int clipEnd = h.getEndTimeSeconds() + CLIP_BUFFER_SECONDS;
            int duration = clipEnd - clipStart;

            String clipTitle = String.format("[AI 클립] %s - %s",
                    h.getHighlightType().name(),
                    h.getDescription() != null ? h.getDescription() : "하이라이트 #" + (i + 1));

            ClipAsset.SourceType sourceType = "LIVE".equalsIgnoreCase(contentType)
                    ? ClipAsset.SourceType.LIVE
                    : ClipAsset.SourceType.VOD;

            ClipAsset clip = ClipAsset.builder()
                    .sourceType(sourceType)
                    .sourceId(contentId)
                    .title(clipTitle)
                    .startTimeSec(clipStart)
                    .endTimeSec(clipEnd)
                    .duration(duration)
                    .encodingStatus(VodAsset.EncodingStatus.PENDING)
                    .visibility(LiveAsset.Visibility.PUBLIC)
                    .isDisplayed(true)
                    .build();

            generatedClips.add(clip);
        }

        List<ClipAsset> saved = clipAssetRepository.saveAll(generatedClips);
        log.info("Generated {} clips from highlights for content {} (type={})",
                saved.size(), contentId, contentType);

        return saved.stream()
                .map(ClipAsset::getId)
                .collect(Collectors.toList());
    }
}
