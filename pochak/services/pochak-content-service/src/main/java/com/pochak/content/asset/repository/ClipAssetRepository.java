package com.pochak.content.asset.repository;

import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClipAssetRepository extends JpaRepository<ClipAsset, Long> {

    Page<ClipAsset> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);

    Optional<ClipAsset> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT ca FROM ClipAsset ca LEFT JOIN FETCH ca.match m LEFT JOIN FETCH m.competition " +
            "WHERE ca.deletedAt IS NULL AND ca.isDisplayed = true ORDER BY ca.viewCount DESC")
    List<ClipAsset> findPopularClips(Pageable pageable);

    @Query("SELECT ca FROM ClipAsset ca LEFT JOIN FETCH ca.match m LEFT JOIN FETCH m.competition " +
            "WHERE ca.deletedAt IS NULL AND ca.isDisplayed = true ORDER BY ca.createdAt DESC")
    List<ClipAsset> findRecentClips(Pageable pageable);

    @Query("SELECT ca FROM ClipAsset ca WHERE ca.deletedAt IS NULL AND ca.isDisplayed = true " +
            "AND ca.match.id = :matchId ORDER BY ca.createdAt DESC")
    List<ClipAsset> findByMatchIdAndDeletedAtIsNull(@Param("matchId") Long matchId, Pageable pageable);

    @Query("SELECT ca FROM ClipAsset ca WHERE ca.deletedAt IS NULL AND ca.isDisplayed = true " +
            "AND ca.id IN (SELECT at.assetId FROM AssetTag at WHERE at.assetType = 'CLIP' " +
            "AND at.tagName IN :tagNames) ORDER BY ca.createdAt DESC")
    List<ClipAsset> findByTagNames(@Param("tagNames") Collection<String> tagNames, Pageable pageable);

    @Query("SELECT ca FROM ClipAsset ca WHERE ca.deletedAt IS NULL" +
            " AND (:sourceType IS NULL OR ca.sourceType = :sourceType)" +
            " AND (:visibility IS NULL OR ca.visibility = :visibility)" +
            " AND (:matchId IS NULL OR ca.match.id = :matchId)" +
            " AND (:creatorUserId IS NULL OR ca.creatorUserId = :creatorUserId)" +
            " AND (:isDisplayed IS NULL OR ca.isDisplayed = :isDisplayed)" +
            " ORDER BY ca.createdAt DESC")
    Page<ClipAsset> findWithFilters(
            @Param("sourceType") ClipAsset.SourceType sourceType,
            @Param("visibility") LiveAsset.Visibility visibility,
            @Param("matchId") Long matchId,
            @Param("creatorUserId") Long creatorUserId,
            @Param("isDisplayed") Boolean isDisplayed,
            Pageable pageable);

    @Query("SELECT ca FROM ClipAsset ca WHERE ca.deletedAt IS NULL AND ca.isDisplayed = true" +
            " AND LOWER(CAST(ca.title AS string)) LIKE LOWER(CAST(CONCAT('%', :keyword, '%') AS string))" +
            " ORDER BY ca.createdAt DESC")
    List<ClipAsset> searchByTitle(@Param("keyword") String keyword, Pageable pageable);
}
