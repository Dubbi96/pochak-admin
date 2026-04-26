package com.pochak.admin.cs.repository;

import com.pochak.admin.cs.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    Page<Inquiry> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Modifying
    @Query("UPDATE Inquiry i SET i.status = :status WHERE i.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    @Query("""
        SELECT i FROM Inquiry i
        WHERE (:status IS NULL OR i.status = :status)
          AND (:category IS NULL OR i.category = :category)
          AND (:keyword IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:dateFrom IS NULL OR i.createdAt >= :dateFrom)
          AND (:dateTo IS NULL OR i.createdAt <= :dateTo)
        ORDER BY i.createdAt DESC
    """)
    Page<Inquiry> findWithFilters(
            @Param("status") String status,
            @Param("category") String category,
            @Param("keyword") String keyword,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
}
