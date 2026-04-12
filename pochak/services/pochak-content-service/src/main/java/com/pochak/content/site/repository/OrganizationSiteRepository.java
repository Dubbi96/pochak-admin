package com.pochak.content.site.repository;

import com.pochak.content.site.entity.OrganizationSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationSiteRepository extends JpaRepository<OrganizationSite, Long> {

    Optional<OrganizationSite> findByOwnerTypeAndOwnerIdAndPublishedTrue(String ownerType, Long ownerId);

    Optional<OrganizationSite> findByOwnerTypeAndOwnerId(String ownerType, Long ownerId);
}
