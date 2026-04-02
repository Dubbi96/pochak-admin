package com.pochak.content.community.repository;

import com.pochak.content.community.entity.CommunityPost;
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
     * DATA-001: Anonymize author for withdrawn users — set authorUserId to -1 (탈퇴한 사용자).
     */
    @Modifying
    @Query("UPDATE CommunityPost p SET p.authorUserId = -1 WHERE p.authorUserId = :userId")
    int anonymizeAuthor(@Param("userId") Long userId);

    /**
     * DATA-006: Atomic counter increments to prevent race conditions on concurrent updates.
     */
    @Modifying
    @Query("UPDATE CommunityPost p SET p.viewCount = p.viewCount + 1 WHERE p.id = :postId")
    void incrementViewCount(@Param("postId") Long postId);

    @Modifying
    @Query("UPDATE CommunityPost p SET p.likeCount = p.likeCount + :delta WHERE p.id = :postId")
    void updateLikeCount(@Param("postId") Long postId, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE CommunityPost p SET p.commentCount = p.commentCount + :delta WHERE p.id = :postId")
    void updateCommentCount(@Param("postId") Long postId, @Param("delta") int delta);
}
