package com.pochak.content.watchhistory.service;

import com.pochak.content.history.entity.ViewHistory;
import com.pochak.content.history.repository.ViewHistoryRepository;
import com.pochak.content.watchhistory.dto.RecordWatchEventRequest;
import com.pochak.content.watchhistory.dto.WatchHistoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WatchHistoryService {

    private final ViewHistoryRepository viewHistoryRepository;

    public Page<WatchHistoryResponse> getWatchHistory(Long userId, Pageable pageable) {
        List<ViewHistory> histories = viewHistoryRepository.findByUserIdOrderByUpdatedAtDesc(userId, pageable);
        List<WatchHistoryResponse> content = histories.stream()
                .map(WatchHistoryResponse::from)
                .toList();
        // Use total from pageable since the existing repository method returns a List
        return new PageImpl<>(content, pageable, content.size());
    }

    @Transactional
    public WatchHistoryResponse recordWatchEvent(Long userId, RecordWatchEventRequest request) {
        boolean completed = request.getTotalSeconds() > 0
                && request.getWatchedSeconds() >= (request.getTotalSeconds() * 0.9);

        ViewHistory entity = ViewHistory.builder()
                .userId(userId)
                .assetType(request.getContentType())
                .assetId(request.getContentId())
                .watchDurationSeconds(request.getWatchedSeconds())
                .lastPositionSeconds(request.getWatchedSeconds())
                .completed(completed)
                .build();

        ViewHistory saved = viewHistoryRepository.save(entity);
        return WatchHistoryResponse.from(saved);
    }
}
