package com.pochak.content.comment.repository;

import com.pochak.content.comment.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Find top-level comments for a content item (parentId is null).
     */
    Page<Comment> findByContentTypeAndContentIdAndParentIdIsNullOrderByCreatedAtDesc(
            String contentType, Long contentId, Pageable pageable);

    /**
     * Find replies to a comment.
     */
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);

    /**
     * Count non-deleted comments for a content item.
     */
    long countByContentTypeAndContentIdAndIsDeletedFalse(String contentType, Long contentId);
}
