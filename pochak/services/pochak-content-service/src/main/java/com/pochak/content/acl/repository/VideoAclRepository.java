package com.pochak.content.acl.repository;

import com.pochak.content.acl.entity.VideoAcl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoAclRepository extends JpaRepository<VideoAcl, Long> {

    Optional<VideoAcl> findByContentTypeAndContentId(VideoAcl.ContentType contentType, Long contentId);
}
