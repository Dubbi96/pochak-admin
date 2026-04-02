package com.pochak.content.livestream.repository;

import com.pochak.content.livestream.entity.LiveStream;
import com.pochak.content.livestream.entity.LiveStream.StreamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LiveStreamRepository extends JpaRepository<LiveStream, Long> {

    Optional<LiveStream> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT ls FROM LiveStream ls WHERE ls.deletedAt IS NULL " +
            "AND (:status IS NULL OR ls.status = :status) " +
            "ORDER BY ls.createdAt DESC")
    Page<LiveStream> findAllByStatus(@Param("status") StreamStatus status, Pageable pageable);

    @Query("SELECT ls FROM LiveStream ls WHERE ls.deletedAt IS NULL " +
            "AND ls.status = 'LIVE' ORDER BY ls.startedAt DESC")
    Page<LiveStream> findAllLive(Pageable pageable);

    @Query("SELECT ls FROM LiveStream ls WHERE ls.deletedAt IS NULL " +
            "AND ls.streamerUserId = :userId ORDER BY ls.createdAt DESC")
    Page<LiveStream> findByStreamerUserId(@Param("userId") Long userId, Pageable pageable);
}
