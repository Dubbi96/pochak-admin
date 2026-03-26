package com.pochak.operation.studio.controller;

import com.pochak.operation.studio.entity.StudioSession;
import com.pochak.operation.studio.repository.StudioSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/studio/sessions")
@RequiredArgsConstructor
public class StudioController {

    private final StudioSessionRepository studioSessionRepository;

    @GetMapping
    public ResponseEntity<Page<StudioSession>> getSessions(
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) Long matchId,
            @PageableDefault(size = 20) Pageable pageable) {
        if (venueId != null) {
            return ResponseEntity.ok(studioSessionRepository.findByVenueIdOrderByCreatedAtDesc(venueId, pageable));
        }
        if (matchId != null) {
            return ResponseEntity.ok(studioSessionRepository.findByMatchIdOrderByCreatedAtDesc(matchId, pageable));
        }
        return ResponseEntity.ok(studioSessionRepository.findAll(pageable));
    }
}
