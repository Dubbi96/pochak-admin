package com.pochak.operation.studio.repository;

import com.pochak.operation.studio.entity.StudioSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudioSessionRepository extends JpaRepository<StudioSession, Long> {

    Page<StudioSession> findByVenueIdOrderByCreatedAtDesc(Long venueId, Pageable pageable);

    Page<StudioSession> findByMatchIdOrderByCreatedAtDesc(Long matchId, Pageable pageable);
}
