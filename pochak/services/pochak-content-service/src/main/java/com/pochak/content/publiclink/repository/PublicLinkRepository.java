package com.pochak.content.publiclink.repository;

import com.pochak.content.publiclink.entity.PublicLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PublicLinkRepository extends JpaRepository<PublicLink, Long> {

    Optional<PublicLink> findBySlugAndActiveTrue(String slug);

    boolean existsBySlugAndActiveTrue(String slug);

    Optional<PublicLink> findByResourceTypeAndResourceIdAndActiveTrue(
            PublicLink.ResourceType resourceType, Long resourceId);
}
