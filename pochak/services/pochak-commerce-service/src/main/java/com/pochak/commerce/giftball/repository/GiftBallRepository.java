package com.pochak.commerce.giftball.repository;

import com.pochak.commerce.giftball.entity.GiftBall;
import com.pochak.commerce.giftball.entity.GiftBallStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GiftBallRepository extends JpaRepository<GiftBall, Long> {

    List<GiftBall> findBySenderUserIdOrderByCreatedAtDesc(Long senderUserId);

    List<GiftBall> findByReceiverUserIdOrderByCreatedAtDesc(Long receiverUserId);

    /** [Admin] status 필터 페이징 조회. status=null 이면 전체. */
    @Query("SELECT gb FROM GiftBall gb WHERE (:status IS NULL OR gb.status = :status) ORDER BY gb.createdAt DESC")
    Page<GiftBall> findForAdmin(@Param("status") GiftBallStatus status, Pageable pageable);
}
