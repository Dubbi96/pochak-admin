package com.pochak.admin.cs.repository;

import com.pochak.admin.cs.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ReportRepository extends JpaRepository<Report, Long> {

    Page<Report> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
        SELECT r FROM Report r
        WHERE (:status IS NULL OR r.status = :status)
          AND (:category IS NULL OR r.reportType = :category)
          AND (:targetType IS NULL OR r.targetType = :targetType)
          AND (:dateFrom IS NULL OR r.createdAt >= :dateFrom)
          AND (:dateTo IS NULL OR r.createdAt <= :dateTo)
        ORDER BY r.createdAt DESC
    """)
    Page<Report> findWithFilters(
            @Param("status") String status,
            @Param("category") String category,
            @Param("targetType") String targetType,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE Report r SET r.status = :status, r.adminComment = :adminNote, r.processedAt = :now WHERE r.id = :id")
    int updateAction(
            @Param("id") Long id,
            @Param("status") String status,
            @Param("adminNote") String adminNote,
            @Param("now") LocalDateTime now
    );
}
