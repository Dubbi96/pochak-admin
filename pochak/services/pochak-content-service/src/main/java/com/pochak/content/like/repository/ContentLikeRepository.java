package com.pochak.content.like.repository;

import com.pochak.content.like.entity.ContentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentLikeRepository extends JpaRepository<ContentLike, Long> {

    Optional<ContentLike> findByUserIdAndContentTypeAndContentId(Long userId, String contentType, Long contentId);

    boolean existsByUserIdAndContentTypeAndContentId(Long userId, String contentType, Long contentId);

    long countByContentTypeAndContentId(String contentType, Long contentId);

    void deleteByUserIdAndContentTypeAndContentId(Long userId, String contentType, Long contentId);
}
