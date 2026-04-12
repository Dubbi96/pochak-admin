package com.pochak.content.site.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.site.dto.SiteResponse;
import com.pochak.content.site.entity.OrganizationSite;
import com.pochak.content.site.repository.OrganizationSiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrganizationSiteService {

    private final OrganizationSiteRepository siteRepository;

    @Transactional(readOnly = true)
    public SiteResponse getPublishedSite(String ownerType, Long ownerId) {
        OrganizationSite site = siteRepository
                .findByOwnerTypeAndOwnerIdAndPublishedTrue(ownerType, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "No published site for " + ownerType + ":" + ownerId));
        return SiteResponse.from(site);
    }

    @Transactional(readOnly = true)
    public SiteResponse getSite(String ownerType, Long ownerId) {
        OrganizationSite site = siteRepository
                .findByOwnerTypeAndOwnerId(ownerType, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "No site for " + ownerType + ":" + ownerId));
        return SiteResponse.from(site);
    }

    @Transactional
    public SiteResponse createSite(String ownerType, Long ownerId, String title, String description) {
        siteRepository.findByOwnerTypeAndOwnerId(ownerType, ownerId)
                .ifPresent(s -> { throw new BusinessException(ErrorCode.DUPLICATE, "Site already exists"); });

        OrganizationSite site = OrganizationSite.builder()
                .ownerType(ownerType)
                .ownerId(ownerId)
                .title(title)
                .description(description)
                .build();

        siteRepository.save(site);
        return SiteResponse.from(site);
    }

    @Transactional
    public SiteResponse updateSite(Long siteId, String title, String description,
                                   String metaTitle, String metaDescription) {
        OrganizationSite site = siteRepository.findById(siteId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        site.updateMeta(title, description, metaTitle, metaDescription);
        return SiteResponse.from(site);
    }

    @Transactional
    public void publishSite(Long siteId) {
        OrganizationSite site = siteRepository.findById(siteId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        site.publish();
    }

    @Transactional
    public void unpublishSite(Long siteId) {
        OrganizationSite site = siteRepository.findById(siteId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        site.unpublish();
    }
}
