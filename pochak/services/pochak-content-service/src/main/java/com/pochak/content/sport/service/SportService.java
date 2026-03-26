package com.pochak.content.sport.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.sport.dto.*;
import com.pochak.content.sport.entity.Sport;
import com.pochak.content.sport.entity.SportTag;
import com.pochak.content.sport.repository.SportRepository;
import com.pochak.content.sport.repository.SportTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SportService {

    private final SportRepository sportRepository;
    private final SportTagRepository sportTagRepository;

    public List<Sport> getAllActiveSports() {
        return sportRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public Sport getSportById(Long id) {
        return sportRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sport not found"));
    }

    public Page<SportListResponse> listSports(Boolean isActive, Pageable pageable) {
        Page<Sport> page;
        if (isActive != null) {
            page = sportRepository.findByActive(isActive, pageable);
        } else {
            page = sportRepository.findAll(pageable);
        }
        return page.map(SportListResponse::from);
    }

    public SportDetailResponse getSportDetail(Long id) {
        Sport sport = getSportById(id);
        return SportDetailResponse.from(sport);
    }

    @Transactional
    public SportDetailResponse createSport(CreateSportRequest request) {
        if (sportRepository.existsByCode(request.getCode())) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Sport code already exists: " + request.getCode());
        }

        Sport sport = Sport.builder()
                .name(request.getName())
                .nameEn(request.getNameEn())
                .code(request.getCode())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .iconUrl(request.getIconUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        Sport saved = sportRepository.save(sport);
        return SportDetailResponse.from(saved);
    }

    @Transactional
    public SportDetailResponse updateSport(Long id, UpdateSportRequest request) {
        Sport sport = getSportById(id);

        if (sportRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Sport code already exists: " + request.getCode());
        }

        sport.update(
                request.getName(),
                request.getNameEn(),
                request.getCode(),
                request.getDescription(),
                request.getImageUrl(),
                request.getIconUrl(),
                request.getDisplayOrder() != null ? request.getDisplayOrder() : sport.getDisplayOrder()
        );

        return SportDetailResponse.from(sport);
    }

    @Transactional
    public void updateDisplayOrders(UpdateDisplayOrderRequest request) {
        for (UpdateDisplayOrderRequest.OrderEntry entry : request.getOrders()) {
            Sport sport = getSportById(entry.getId());
            sport.updateDisplayOrder(entry.getDisplayOrder());
        }
    }

    @Transactional
    public void deleteSport(Long id) {
        Sport sport = getSportById(id);
        sport.softDelete();
    }

    // --- SportTag operations ---

    public List<SportTagResponse> getTagsForSport(Long sportId) {
        // Verify sport exists
        getSportById(sportId);
        return sportTagRepository.findBySportIdOrderByTagAsc(sportId).stream()
                .map(SportTagResponse::from)
                .toList();
    }

    @Transactional
    public SportTagResponse createTag(Long sportId, CreateSportTagRequest request) {
        Sport sport = getSportById(sportId);

        SportTag tag = SportTag.builder()
                .sport(sport)
                .tag(request.getTag())
                .build();

        sport.addTag(tag);
        SportTag saved = sportTagRepository.save(tag);
        return SportTagResponse.from(saved);
    }

    @Transactional
    public SportTagResponse updateTag(Long sportId, Long tagId, CreateSportTagRequest request) {
        // Verify sport exists
        getSportById(sportId);

        SportTag tag = sportTagRepository.findById(tagId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sport tag not found"));

        if (!tag.getSport().getId().equals(sportId)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Tag does not belong to sport");
        }

        tag.updateTag(request.getTag());
        return SportTagResponse.from(tag);
    }

    @Transactional
    public void deleteTag(Long sportId, Long tagId) {
        Sport sport = getSportById(sportId);

        SportTag tag = sportTagRepository.findById(tagId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sport tag not found"));

        if (!tag.getSport().getId().equals(sportId)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Tag does not belong to sport");
        }

        sport.removeTag(tag);
        sportTagRepository.delete(tag);
    }
}
