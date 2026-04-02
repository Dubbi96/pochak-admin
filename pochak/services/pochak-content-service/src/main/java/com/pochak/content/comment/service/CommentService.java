package com.pochak.content.comment.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.comment.dto.*;
import com.pochak.content.comment.entity.Comment;
import com.pochak.content.comment.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;

    /**
     * List top-level comments for a content item.
     */
    public Page<CommentResponse> listComments(String contentType, Long contentId, Pageable pageable) {
        return commentRepository
                .findByContentTypeAndContentIdAndParentIdIsNullOrderByCreatedAtDesc(
                        contentType.toUpperCase(), contentId, pageable)
                .map(CommentResponse::from);
    }

    /**
     * Add a comment to a content item.
     */
    @Transactional
    public CommentResponse addComment(String contentType, Long contentId, CreateCommentRequest request) {
        // If this is a reply, validate parent exists
        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                            "Parent comment not found: " + request.getParentId()));
            // Replies must be on the same content
            if (!parent.getContentId().equals(contentId)
                    || !parent.getContentType().equalsIgnoreCase(contentType)) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "Parent comment does not belong to the same content");
            }
        }

        Comment comment = Comment.builder()
                .contentId(contentId)
                .contentType(contentType.toUpperCase())
                .userId(request.getUserId())
                .body(request.getBody())
                .parentId(request.getParentId())
                .build();

        Comment saved = commentRepository.save(comment);
        return CommentResponse.from(saved);
    }

    /**
     * Delete own comment (soft delete).
     */
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Comment not found: " + commentId));

        if (!comment.isOwnedBy(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Only the comment author can delete this comment");
        }

        comment.softDelete();
    }

    /**
     * Get replies to a specific comment.
     */
    public List<CommentResponse> getReplies(Long commentId) {
        // Verify parent exists
        commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Comment not found: " + commentId));

        return commentRepository.findByParentIdOrderByCreatedAtAsc(commentId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }
}
