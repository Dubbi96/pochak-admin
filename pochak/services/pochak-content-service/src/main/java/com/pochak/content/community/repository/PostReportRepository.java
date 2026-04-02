package com.pochak.content.community.repository;

import com.pochak.content.community.entity.ModerationStatus;
import com.pochak.content.community.entity.PostReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostReportRepository extends JpaRepository<PostReport, Long> {

    List<PostReport> findByPostId(Long postId);

    Page<PostReport> findByStatus(ModerationStatus status, Pageable pageable);

    @Query("SELECT r FROM PostReport r WHERE r.status = :status " +
           "AND r.postId IN (SELECT p.id FROM CommunityPost p WHERE p.organizationId = :organizationId) " +
           "ORDER BY r.createdAt ASC")
    Page<PostReport> findPendingByOrganization(@Param("status") ModerationStatus status,
                                                @Param("organizationId") Long organizationId,
                                                Pageable pageable);
}
