package com.pochak.content.community.repository;

import com.pochak.content.community.entity.CommunityPost;
import com.pochak.content.community.entity.ModerationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    List<CommunityPost> findByAuthorUserIdAndWarningCountGreaterThan(Long authorUserId, Integer warningCount);

    Page<CommunityPost> findByDeletedAtIsNullOrderByIsPinnedDescCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM CommunityPost p WHERE p.deletedAt IS NULL " +
           "AND (:postType IS NULL OR p.postType = :postType) " +
           "AND (:siGunGuCode IS NULL OR p.siGunGuCode = :siGunGuCode) " +
           "AND (:organizationId IS NULL OR p.organizationId = :organizationId) " +
           "ORDER BY p.isPinned DESC, p.createdAt DESC")
    Page<CommunityPost> findWithFilters(@Param("postType") CommunityPost.PostType postType,
                                        @Param("siGunGuCode") String siGunGuCode,
                                        @Param("organizationId") Long organizationId,
                                        Pageable pageable);

    /**
     * [Admin] Find posts with optional filters including deleted posts.
     * status=null, keyword=null, organizationId=null 이면 전체 조회.
     */
    @Query("SELECT p FROM CommunityPost p WHERE " +
           "(:status IS NULL OR p.moderationStatus = :status) " +
           "AND (:organizationId IS NULL OR p.organizationId = :organizationId) " +
           "AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.body) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<CommunityPost> findForAdmin(@Param("status") ModerationStatus status,
                                     @Param("keyword") String keyword,
                                     @Param("organizationId") Long organizationId,
                                     Pageable pageable);

    /**
     * DATA-001: Anonymize author for withdrawn users — set authorUserId to -1 (탈퇴한 사용자).
     */
    @Modifying
    @Query("UPDATE CommunityPost p SET p.authorUserId = -1 WHERE p.authorUserId = :userId")
    int anonymizeAuthor(@Param("userId") Long userId);
}
