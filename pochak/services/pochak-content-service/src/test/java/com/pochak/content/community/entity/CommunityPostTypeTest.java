package com.pochak.content.community.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * L4: PostType 정책 정합 테스트.
 * 정책: NEWS, RECRUIT, GENERAL, FREE
 * 이전: NEWS, RECRUITING, RECRUITMENT, FREE
 */
class CommunityPostTypeTest {

    @Test
    @DisplayName("NEWS PostType으로 커뮤니티 글 생성")
    void newsPostType() {
        CommunityPost post = CommunityPost.builder()
                .authorUserId(1L)
                .postType(CommunityPost.PostType.NEWS)
                .title("공지사항")
                .build();

        assertThat(post.getPostType()).isEqualTo(CommunityPost.PostType.NEWS);
    }

    @Test
    @DisplayName("RECRUIT PostType으로 커뮤니티 글 생성")
    void recruitPostType() {
        CommunityPost post = CommunityPost.builder()
                .authorUserId(1L)
                .postType(CommunityPost.PostType.RECRUIT)
                .title("팀원 모집합니다")
                .build();

        assertThat(post.getPostType()).isEqualTo(CommunityPost.PostType.RECRUIT);
    }

    @Test
    @DisplayName("GENERAL PostType으로 커뮤니티 글 생성")
    void generalPostType() {
        CommunityPost post = CommunityPost.builder()
                .authorUserId(1L)
                .postType(CommunityPost.PostType.GENERAL)
                .title("자유 게시판 글")
                .build();

        assertThat(post.getPostType()).isEqualTo(CommunityPost.PostType.GENERAL);
    }

    @Test
    @DisplayName("FREE PostType으로 커뮤니티 글 생성")
    void freePostType() {
        CommunityPost post = CommunityPost.builder()
                .authorUserId(1L)
                .postType(CommunityPost.PostType.FREE)
                .title("자유 글")
                .build();

        assertThat(post.getPostType()).isEqualTo(CommunityPost.PostType.FREE);
    }

    @Test
    @DisplayName("구 PostType (RECRUITING) 사용 시 IllegalArgumentException")
    void legacyRecruiting_throws() {
        assertThatThrownBy(() -> CommunityPost.PostType.valueOf("RECRUITING"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("구 PostType (RECRUITMENT) 사용 시 IllegalArgumentException")
    void legacyRecruitment_throws() {
        assertThatThrownBy(() -> CommunityPost.PostType.valueOf("RECRUITMENT"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("모든 정책 PostType 값 확인")
    void allPolicyPostTypes() {
        CommunityPost.PostType[] values = CommunityPost.PostType.values();
        assertThat(values).hasSize(4);
        assertThat(values).containsExactly(
                CommunityPost.PostType.NEWS,
                CommunityPost.PostType.RECRUIT,
                CommunityPost.PostType.GENERAL,
                CommunityPost.PostType.FREE
        );
    }
}
