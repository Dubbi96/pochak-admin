package com.pochak.content.history.repository;

import com.pochak.content.history.entity.ViewHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ViewHistoryRepository extends JpaRepository<ViewHistory, Long> {

    List<ViewHistory> findByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT vh.assetType, vh.assetId, COUNT(vh) as cnt FROM ViewHistory vh " +
            "WHERE vh.userId = :userId GROUP BY vh.assetType, vh.assetId ORDER BY cnt DESC")
    List<Object[]> findMostWatchedByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT vh.assetType, vh.assetId, SUM(vh.watchDurationSeconds) as totalDuration " +
            "FROM ViewHistory vh WHERE vh.userId = :userId " +
            "GROUP BY vh.assetType, vh.assetId ORDER BY totalDuration DESC")
    List<Object[]> findMostWatchedByDuration(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT vh.assetId FROM ViewHistory vh " +
            "WHERE vh.assetType = :assetType AND vh.createdAt >= :since " +
            "GROUP BY vh.assetId ORDER BY COUNT(vh) DESC")
    List<Long> findTrendingAssetIds(
            @Param("assetType") String assetType,
            @Param("since") LocalDateTime since,
            Pageable pageable);

    /**
     * DATA-001: Delete all view histories for a withdrawn user.
     */
    @Modifying
    @Query("DELETE FROM ViewHistory vh WHERE vh.userId = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);
}
