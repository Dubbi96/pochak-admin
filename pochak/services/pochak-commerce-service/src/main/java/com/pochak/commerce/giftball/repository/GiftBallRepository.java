package com.pochak.commerce.giftball.repository;

import com.pochak.commerce.giftball.entity.GiftBall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GiftBallRepository extends JpaRepository<GiftBall, Long> {

    List<GiftBall> findBySenderUserIdOrderByCreatedAtDesc(Long senderUserId);

    List<GiftBall> findByReceiverUserIdOrderByCreatedAtDesc(Long receiverUserId);
}
