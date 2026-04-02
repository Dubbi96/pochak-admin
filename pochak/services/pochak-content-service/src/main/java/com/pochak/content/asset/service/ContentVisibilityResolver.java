package com.pochak.content.asset.service;

import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.organization.entity.Organization;
import com.pochak.content.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Resolves the default content visibility for assets based on the owning organization's policy.
 *
 * <p>Policy mapping (from POCHAK_POLICY.md):
 * <ul>
 *   <li>OPEN org (포착시티): new content defaults to PUBLIC</li>
 *   <li>CLOSED org (포착클럽): new content defaults to MEMBERS_ONLY</li>
 *   <li>No owning org or explicit visibility provided: use caller's value</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ContentVisibilityResolver {

    private final OrganizationRepository organizationRepository;

    /**
     * Resolves the effective visibility for a new content asset.
     *
     * @param explicitVisibility visibility explicitly requested by the caller (may be null)
     * @param ownerType          the owner type of the asset (ORGANIZATION, TEAM, etc.)
     * @param ownerId            the owner ID
     * @return the resolved visibility; falls back to PUBLIC if no org context is available
     */
    public LiveAsset.Visibility resolve(LiveAsset.Visibility explicitVisibility,
                                         LiveAsset.OwnerType ownerType,
                                         Long ownerId) {
        // If the caller explicitly specified a visibility, respect it
        if (explicitVisibility != null) {
            return explicitVisibility;
        }

        // Try to infer default from the owning organization
        if (ownerType == LiveAsset.OwnerType.ORGANIZATION && ownerId != null) {
            return organizationRepository.findByIdAndActiveTrue(ownerId)
                    .map(this::mapOrgVisibility)
                    .orElse(LiveAsset.Visibility.PUBLIC);
        }

        return LiveAsset.Visibility.PUBLIC;
    }

    private LiveAsset.Visibility mapOrgVisibility(Organization org) {
        if (org.getDefaultContentVisibility() == Organization.ContentVisibility.MEMBERS_ONLY) {
            log.debug("[ContentVisibility] CLOSED org {} defaulting to MEMBERS_ONLY", org.getId());
            return LiveAsset.Visibility.MEMBERS_ONLY;
        }
        return LiveAsset.Visibility.PUBLIC;
    }
}
