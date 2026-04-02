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
            " AND (CAST(:orgType AS string) IS NULL OR o.orgType = :orgType)" +
            " AND (CAST(:parentId AS long) IS NULL OR o.parent.id = :parentId)" +
            " AND (CAST(:sportId AS long) IS NULL OR o.sportId = :sportId)" +
            " AND (CAST(:keyword AS string) IS NULL OR LOWER(CAST(o.name AS string)) LIKE LOWER(CAST(CONCAT('%', :keyword, '%') AS string)))" +
            " ORDER BY o.name ASC")
    Page<Organization> findWithFilters(
            @Param("orgType") Organization.OrgType orgType,
            @Param("parentId") Long parentId,
            @Param("sportId") Long sportId,
            @Param("keyword") String keyword,
            Pageable pageable);

    List<Organization> findByParentIdAndActiveTrue(Long parentId);

    @Query("SELECT o FROM Organization o WHERE o.active = true" +
            " AND LOWER(CAST(o.name AS string)) LIKE LOWER(CAST(CONCAT('%', :keyword, '%') AS string))" +
            " ORDER BY o.name ASC")
    List<Organization> searchByName(@Param("keyword") String keyword, Pageable pageable);
}
