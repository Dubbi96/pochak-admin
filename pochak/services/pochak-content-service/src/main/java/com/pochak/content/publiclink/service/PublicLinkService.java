package com.pochak.content.publiclink.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.publiclink.dto.CreatePublicLinkRequest;
import com.pochak.content.publiclink.dto.PublicResolveResponse;
import com.pochak.content.publiclink.dto.SlugCheckResponse;
import com.pochak.content.publiclink.entity.PublicLink;
import com.pochak.content.publiclink.repository.PublicLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicLinkService {

    private final PublicLinkRepository publicLinkRepository;

    @Transactional(readOnly = true)
    public PublicResolveResponse resolve(String slug) {
        PublicLink link = publicLinkRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "No resource found for slug: " + slug));
        return PublicResolveResponse.from(link);
    }

    @Transactional(readOnly = true)
    public SlugCheckResponse checkAvailability(String slug) {
        boolean taken = publicLinkRepository.existsBySlugAndActiveTrue(slug);
        return new SlugCheckResponse(slug, !taken);
    }

    @Transactional
    public PublicResolveResponse createLink(CreatePublicLinkRequest request) {
        if (publicLinkRepository.existsBySlugAndActiveTrue(request.getSlug())) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Slug already in use: " + request.getSlug());
        }

        PublicLink.ResourceType resourceType = PublicLink.ResourceType.valueOf(request.getResourceType());

        publicLinkRepository.findByResourceTypeAndResourceIdAndActiveTrue(resourceType, request.getResourceId())
                .ifPresent(PublicLink::deactivate);

        PublicLink link = PublicLink.builder()
                .slug(request.getSlug())
                .resourceType(resourceType)
                .resourceId(request.getResourceId())
                .build();

        publicLinkRepository.save(link);
        return PublicResolveResponse.from(link);
    }
}
