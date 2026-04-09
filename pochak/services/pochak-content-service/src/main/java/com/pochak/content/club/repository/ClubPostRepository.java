package com.pochak.content.club.repository;

import com.pochak.content.club.entity.ClubPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubPostRepository extends JpaRepository<ClubPost, Long> {

    @Query("SELECT p FROM ClubPost p WHERE p.clubId = :clubId AND p.deletedAt IS NULL" +
            " ORDER BY p.pinned DESC, p.createdAt DESC")
    Page<ClubPost> findByClubId(@Param("clubId") Long clubId, Pageable pageable);

    long countByClubIdAndDeletedAtIsNull(Long clubId);
}
