package com.pochak.content.community.repository;

import com.pochak.content.community.entity.ModerationAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationActionRepository extends JpaRepository<ModerationAction, Long> {

    List<ModerationAction> findByPostIdOrderByCreatedAtDesc(Long postId);

    long countByPostIdAndActionType(Long postId, ModerationAction.ActionType actionType);
}
