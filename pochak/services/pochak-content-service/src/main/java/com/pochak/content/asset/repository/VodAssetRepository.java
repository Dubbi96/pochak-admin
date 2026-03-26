package com.pochak.content.asset.repository;

import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VodAssetRepository extends JpaRepository<VodAsset, Long> {

    Page<VodAsset> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);

    Optional<VodAsset> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT va FROM VodAsset va LEFT JOIN FETCH va.match m LEFT JOIN FETCH m.competition " +
            "WHERE va.deletedAt IS NULL AND va.isDisplayed = true ORDER BY va.viewCount DESC")
    List<VodAsset> findPopularVods(Pageable pageable);

    @Query("SELECT va FROM VodAsset va LEFT JOIN FETCH va.match m LEFT JOIN FETCH m.competition " +
            "WHERE va.deletedAt IS NULL AND va.isDisplayed = true ORDER BY va.createdAt DESC")
    List<VodAsset> findRecentVods(Pageable pageable);

    @Query("SELECT va FROM VodAsset va WHERE va.deletedAt IS NULL AND va.isDisplayed = true " +
            "AND va.id IN (SELECT at.assetId FROM AssetTag at WHERE at.assetType = 'VOD' " +
            "AND at.tagName IN :tagNames) ORDER BY va.createdAt DESC")
    List<VodAsset> findByTagNames(@Param("tagNames") Collection<String> tagNames, Pageable pageable);

    @Query("SELECT va FROM VodAsset va WHERE va.deletedAt IS NULL AND va.match.id IN :matchIds")
    List<VodAsset> findByMatchIdIn(@Param("matchIds") Collection<Long> matchIds);

    @Query("SELECT va FROM VodAsset va LEFT JOIN va.match m WHERE va.deletedAt IS NULL" +
            " AND (:ownerType IS NULL OR va.ownerType = :ownerType)" +
            " AND (:venueId IS NULL OR m.venue = :venueId)" +
            " AND (:dateFrom IS NULL OR va.createdAt >= :dateFrom)" +
            " AND (:dateTo IS NULL OR va.createdAt <= :dateTo)" +
            " AND (:isDisplayed IS NULL OR va.isDisplayed = :isDisplayed)" +
            " AND (:visibility IS NULL OR va.visibility = :visibility)" +
            " ORDER BY va.createdAt DESC")
    Page<VodAsset> findWithFilters(
            @Param("ownerType") LiveAsset.OwnerType ownerType,
            @Param("venueId") String venueId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("isDisplayed") Boolean isDisplayed,
            @Param("visibility") LiveAsset.Visibility visibility,
            Pageable pageable);

    @Query("SELECT va FROM VodAsset va WHERE va.deletedAt IS NULL AND va.isDisplayed = true" +
            " AND LOWER(va.title) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            " ORDER BY va.createdAt DESC")
    List<VodAsset> searchByTitle(@Param("keyword") String keyword, Pageable pageable);
}
