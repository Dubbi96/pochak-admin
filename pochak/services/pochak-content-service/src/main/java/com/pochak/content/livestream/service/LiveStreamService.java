package com.pochak.content.livestream.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.PageMeta;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.repository.MatchRepository;
import com.pochak.content.livestream.dto.*;
import com.pochak.content.livestream.entity.LiveStream;
import com.pochak.content.livestream.entity.LiveStream.StreamStatus;
import com.pochak.content.livestream.repository.LiveStreamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LiveStreamService {

    private final LiveStreamRepository liveStreamRepository;
    private final MatchRepository matchRepository;
    private final ViewerCountService viewerCountService;

    @Transactional
    public LiveStreamResponse create(Long userId, CreateLiveStreamRequest request) {
        Match match = null;
        if (request.getMatchId() != null) {
            match = matchRepository.findById(request.getMatchId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "매치를 찾을 수 없습니다"));
        }

        LiveStream stream = LiveStream.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .streamerUserId(userId)
                .match(match)
                .streamKey(generateStreamKey())
                .thumbnailUrl(request.getThumbnailUrl())
                .visibility(request.getVisibility())
                .scheduledAt(request.getScheduledAt())
                .build();

        LiveStream saved = liveStreamRepository.save(stream);
        log.info("Live stream created: id={}, title={}, streamer={}", saved.getId(), saved.getTitle(), userId);
        return LiveStreamResponse.from(saved);
    }

    @Transactional
    public LiveStreamResponse start(Long streamId, Long userId, StartLiveStreamRequest request) {
        LiveStream stream = findByIdOrThrow(streamId);
        validateOwnership(stream, userId);

        String streamUrl = request != null && request.getStreamUrl() != null
                ? request.getStreamUrl()
                : generateDefaultStreamUrl(stream.getStreamKey());

        stream.start(streamUrl);
        log.info("Live stream started: id={}", streamId);
        return LiveStreamResponse.from(stream);
    }

    @Transactional
    public LiveStreamResponse stop(Long streamId, Long userId) {
        LiveStream stream = findByIdOrThrow(streamId);
        validateOwnership(stream, userId);

        int peakCount = viewerCountService.getPeakViewerCount(streamId);
        int currentCount = viewerCountService.getCurrentViewerCount(streamId);
        long totalCount = Math.max(peakCount, currentCount);

        stream.stop(peakCount, totalCount);
        viewerCountService.resetViewers(streamId);

        log.info("Live stream stopped: id={}, peak={}, total={}", streamId, peakCount, totalCount);
        return LiveStreamResponse.from(stream);
    }

    public LiveStreamResponse getById(Long streamId) {
        LiveStream stream = findByIdOrThrow(streamId);
        int currentViewers = stream.getStatus() == StreamStatus.LIVE
                ? viewerCountService.getCurrentViewerCount(streamId)
                : 0;
        return LiveStreamResponse.from(stream, currentViewers);
    }

    public Page<LiveStreamResponse> listByStatus(StreamStatus status, Pageable pageable) {
        Page<LiveStream> page = liveStreamRepository.findAllByStatus(status, pageable);
        return page.map(stream -> {
            int viewers = stream.getStatus() == StreamStatus.LIVE
                    ? viewerCountService.getCurrentViewerCount(stream.getId())
                    : 0;
            return LiveStreamResponse.from(stream, viewers);
        });
    }

    public Page<LiveStreamResponse> listLive(Pageable pageable) {
        Page<LiveStream> page = liveStreamRepository.findAllLive(pageable);
        return page.map(stream -> LiveStreamResponse.from(stream,
                viewerCountService.getCurrentViewerCount(stream.getId())));
    }

    public ViewerCountResponse joinStream(Long streamId, Long userId) {
        LiveStream stream = findByIdOrThrow(streamId);
        if (stream.getStatus() != StreamStatus.LIVE) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "방송 중인 스트림만 참여할 수 있습니다");
        }
        int currentCount = viewerCountService.join(streamId, userId);
        return new ViewerCountResponse(streamId, currentCount,
                viewerCountService.getPeakViewerCount(streamId));
    }

    public ViewerCountResponse leaveStream(Long streamId, Long userId) {
        int currentCount = viewerCountService.leave(streamId, userId);
        return new ViewerCountResponse(streamId, currentCount,
                viewerCountService.getPeakViewerCount(streamId));
    }

    public ViewerCountResponse getViewerCount(Long streamId) {
        findByIdOrThrow(streamId);
        int current = viewerCountService.getCurrentViewerCount(streamId);
        int peak = viewerCountService.getPeakViewerCount(streamId);
        return new ViewerCountResponse(streamId, current, peak);
    }

    private LiveStream findByIdOrThrow(Long streamId) {
        return liveStreamRepository.findByIdAndDeletedAtIsNull(streamId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "라이브 스트림을 찾을 수 없습니다"));
    }

    private void validateOwnership(LiveStream stream, Long userId) {
        if (!stream.getStreamerUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "방송 소유자만 이 작업을 수행할 수 있습니다");
        }
    }

    private String generateStreamKey() {
        return "pck-live-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    private String generateDefaultStreamUrl(String streamKey) {
        return "rtmp://live.pochak.co.kr/live/" + streamKey;
    }
}
