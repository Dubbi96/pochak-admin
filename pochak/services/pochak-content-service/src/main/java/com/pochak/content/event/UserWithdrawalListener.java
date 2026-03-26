package com.pochak.content.event;

import com.pochak.common.event.RabbitMqConfig;
import com.pochak.common.event.UserWithdrawnEvent;
import com.pochak.content.comment.repository.CommentRepository;
import com.pochak.content.community.repository.CommunityPostRepository;
import com.pochak.content.favorite.repository.FavoriteRepository;
import com.pochak.content.follow.repository.FollowRepository;
import com.pochak.content.history.repository.ViewHistoryRepository;
import com.pochak.content.like.repository.ContentLikeRepository;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * DATA-001: Handles user withdrawal cleanup for the content service.
 *
 * Per-table policy:
 *   - community_posts: anonymize author_user_id to -1 (keep post, show "탈퇴한 사용자")
 *   - memberships: DELETE
 *   - follows: DELETE (both directions)
 *   - comments: DELETE
 *   - content_likes: DELETE
 *   - view_histories: DELETE
 *   - favorites: DELETE
 *   - notifications: DELETE
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserWithdrawalListener {

    private final CommunityPostRepository communityPostRepository;
    private final MembershipRepository membershipRepository;
    private final FollowRepository followRepository;
    private final CommentRepository commentRepository;
    private final ContentLikeRepository contentLikeRepository;
    private final ViewHistoryRepository viewHistoryRepository;
    private final FavoriteRepository favoriteRepository;
    private final NotificationRepository notificationRepository;

    @RabbitListener(queues = RabbitMqConfig.QUEUE_CONTENT)
    @Transactional
    public void handleUserWithdrawn(UserWithdrawnEvent event) {
        if (!UserWithdrawnEvent.ROUTING_KEY.equals(event.getEventType())) {
            return;
        }

        Long userId = event.getUserId();
        log.info("[UserWithdrawal] Processing content cleanup for userId={}", userId);

        // 1. community_posts: anonymize author (keep post, show "탈퇴한 사용자")
        int postsAnonymized = communityPostRepository.anonymizeAuthor(userId);
        log.debug("[UserWithdrawal] Anonymized {} community posts for userId={}", postsAnonymized, userId);

        // 2. memberships: delete all
        int membershipsDeleted = membershipRepository.deleteAllByUserId(userId);
        log.debug("[UserWithdrawal] Deleted {} memberships for userId={}", membershipsDeleted, userId);

        // 3. follows: delete (both as follower and as followed user)
        int followsDeleted = followRepository.deleteAllByUserId(userId);
        log.debug("[UserWithdrawal] Deleted {} follows for userId={}", followsDeleted, userId);

        // 4. comments: delete
        int commentsDeleted = commentRepository.deleteAllByUserId(userId);
        log.debug("[UserWithdrawal] Deleted {} comments for userId={}", commentsDeleted, userId);

        // 5. content_likes: delete
        int likesDeleted = contentLikeRepository.deleteAllByUserId(userId);
        log.debug("[UserWithdrawal] Deleted {} likes for userId={}", likesDeleted, userId);

        // 6. view_histories: delete
        int historiesDeleted = viewHistoryRepository.deleteAllByUserId(userId);
        log.debug("[UserWithdrawal] Deleted {} view histories for userId={}", historiesDeleted, userId);

        // 7. favorites: delete
        int favoritesDeleted = favoriteRepository.deleteAllByUserId(userId);
        log.debug("[UserWithdrawal] Deleted {} favorites for userId={}", favoritesDeleted, userId);

        // 8. notifications: delete
        int notificationsDeleted = notificationRepository.deleteAllByTargetUserId(userId);
        log.debug("[UserWithdrawal] Deleted {} notifications for userId={}", notificationsDeleted, userId);

        log.info("[UserWithdrawal] Content cleanup complete for userId={}: " +
                        "posts_anonymized={}, memberships={}, follows={}, comments={}, " +
                        "likes={}, histories={}, favorites={}, notifications={}",
                userId, postsAnonymized, membershipsDeleted, followsDeleted,
                commentsDeleted, likesDeleted, historiesDeleted, favoritesDeleted, notificationsDeleted);
    }
}
