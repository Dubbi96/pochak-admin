package com.pochak.content.community.repository;

import com.pochak.content.community.entity.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

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
}
