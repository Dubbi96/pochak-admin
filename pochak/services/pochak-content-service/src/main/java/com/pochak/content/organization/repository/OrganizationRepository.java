package com.pochak.content.organization.repository;

import com.pochak.content.organization.entity.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    List<Organization> findByOrgType(Organization.OrgType orgType);

    List<Organization> findByParentId(Long parentId);

    List<Organization> findByParentIdIsNull();

    Optional<Organization> findByIdAndActiveTrue(Long id);

    @Query("SELECT o FROM Organization o WHERE o.active = true" +
            " AND (:orgType IS NULL OR o.orgType = :orgType)" +
            " AND (:parentId IS NULL OR o.parent.id = :parentId)" +
            " AND (:sportId IS NULL OR o.sportId = :sportId)" +
            " AND (:keyword IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            " ORDER BY o.name ASC")
    Page<Organization> findWithFilters(
            @Param("orgType") Organization.OrgType orgType,
            @Param("parentId") Long parentId,
            @Param("sportId") Long sportId,
            @Param("keyword") String keyword,
            Pageable pageable);

    List<Organization> findByParentIdAndActiveTrue(Long parentId);

    @Query("SELECT o FROM Organization o WHERE o.active = true" +
            " AND LOWER(o.name) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            " ORDER BY o.name ASC")
    List<Organization> searchByName(@Param("keyword") String keyword, Pageable pageable);
}
