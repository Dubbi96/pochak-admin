package com.pochak.content.sharing.repository;

import com.pochak.content.sharing.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShareRepository extends JpaRepository<Share, Long> {

    long countByContentTypeAndContentId(String contentType, Long contentId);
}
