package com.pochak.content.competition.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.competition.dto.*;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.CompetitionVisibility;
import com.pochak.content.competition.entity.CompetitionVisit;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.competition.repository.CompetitionVisitRepository;
import com.pochak.content.sport.entity.Sport;
import com.pochak.content.sport.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompetitionService {

    private final CompetitionRepository competitionRepository;
    private final CompetitionVisitRepository competitionVisitRepository;
    private final SportRepository sportRepository;

    public Page<CompetitionListResponse> listCompetitions(Long sportId,
                                                          Competition.CompetitionStatus status,
                                                          Boolean isDisplayed,
                                                          String keyword,
                                                          Pageable pageable) {
        String keywordPattern = keyword != null ? "%" + keyword.toLowerCase() + "%" : null;
        // Public listing: only show PUBLIC competitions
        Page<Competition> page = competitionRepository.findWithFiltersAndVisibility(
                sportId, status, isDisplayed, keywordPattern, CompetitionVisibility.PUBLIC, pageable);
        return page.map(CompetitionListResponse::from);
    }

    public Page<CompetitionListResponse> listCompetitionsAdmin(Long sportId,
                                                                Competition.CompetitionStatus status,
                                                                Boolean isDisplayed,
                                                                String keyword,
                                                                Pageable pageable) {
        String keywordPattern = keyword != null ? "%" + keyword.toLowerCase() + "%" : null;
        // Admin listing: show all competitions regardless of visibility
        Page<Competition> page = competitionRepository.findWithFilters(
                sportId, status, isDisplayed, keywordPattern, pageable);
        return page.map(CompetitionListResponse::from);
    }

    public CompetitionDetailResponse getCompetitionDetail(Long id) {
        Competition competition = findActiveCompetition(id);
        return CompetitionDetailResponse.from(competition);
    }

    @Transactional
    public CompetitionDetailResponse createCompetition(CreateCompetitionRequest request) {
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sport not found: " + request.getSportId()));

        Competition.CompetitionType competitionType = null;
        if (request.getCompetitionType() != null) {
            try {
                competitionType = Competition.CompetitionType.valueOf(request.getCompetitionType());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid competition type: " + request.getCompetitionType());
            }
        }

        CompetitionVisibility visibility = CompetitionVisibility.PUBLIC;
        if (request.getVisibility() != null) {
            try {
                visibility = CompetitionVisibility.valueOf(request.getVisibility());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid visibility: " + request.getVisibility());
            }
        }

        String inviteCode = null;
        if (visibility == CompetitionVisibility.PRIVATE) {
            inviteCode = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        }

        Competition competition = Competition.builder()
                .name(request.getName())
                .shortName(request.getShortName())
                .competitionType(competitionType != null ? competitionType : Competition.CompetitionType.TOURNAMENT)
                .sport(sport)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getDescription())
                .visibility(visibility)
                .inviteCode(inviteCode)
                .isFree(request.getIsFree() != null ? request.getIsFree() : false)
                .isDisplayed(request.getIsDisplayed() != null ? request.getIsDisplayed() : true)
                .build();

        Competition saved = competitionRepository.save(competition);
        return CompetitionDetailResponse.from(saved);
    }

    @Transactional
    public CompetitionDetailResponse updateCompetition(Long id, UpdateCompetitionRequest request) {
        Competition competition = findActiveCompetition(id);

        Sport sport = null;
        if (request.getSportId() != null && !request.getSportId().equals(competition.getSport().getId())) {
            sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sport not found: " + request.getSportId()));
        }

        Competition.CompetitionType competitionType = null;
        if (request.getCompetitionType() != null) {
            try {
                competitionType = Competition.CompetitionType.valueOf(request.getCompetitionType());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid competition type: " + request.getCompetitionType());
            }
        }

        competition.update(
                request.getName(),
                request.getShortName(),
                competitionType,
                request.getSportId(),
                sport,
                request.getStartDate(),
                request.getEndDate(),
                request.getDescription(),
                request.getIsFree(),
                request.getIsDisplayed()
        );

        return CompetitionDetailResponse.from(competition);
    }

    @Transactional
    public void deleteCompetition(Long id) {
        Competition competition = findActiveCompetition(id);
        competition.softDelete();
    }

    private static final int VISIT_EXPIRATION_DAYS = 30;

    @Transactional
    public CompetitionDetailResponse accessPrivateCompetition(String inviteCode, Long userId) {
        String maskedCode = inviteCode.length() > 4 ? inviteCode.substring(0, 4) + "***" : "***";
        Competition competition = competitionRepository.findByInviteCodeAndActiveTrue(inviteCode)
                .orElseThrow(() -> {
                    log.warn("Invalid invite code attempt: userId={}, code={}", userId, maskedCode);
                    return new BusinessException(ErrorCode.NOT_FOUND, "Invalid invite code");
                });

        // Calculate expiration: competition endDate + 30 days, or null if no endDate
        LocalDateTime expiresAt = null;
        if (competition.getEndDate() != null) {
            expiresAt = competition.getEndDate().plusDays(VISIT_EXPIRATION_DAYS).atStartOfDay();
        }

        // Check for existing visit and update, or create new
        var existingVisit = competitionVisitRepository.findByUserIdAndCompetitionId(userId, competition.getId());
        if (existingVisit.isEmpty()) {
            CompetitionVisit visit = CompetitionVisit.builder()
                    .userId(userId)
                    .competition(competition)
                    .firstVisitedAt(LocalDateTime.now())
                    .expiresAt(expiresAt)
                    .inviteCodeVersion(inviteCode)
                    .build();
            competitionVisitRepository.save(visit);
        }

        return CompetitionDetailResponse.from(competition);
    }

    @Transactional
    public CompetitionDetailResponse regenerateInviteCode(Long competitionId) {
        Competition competition = findActiveCompetition(competitionId);
        if (competition.getVisibility() != CompetitionVisibility.PRIVATE) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Can only regenerate invite code for private competitions");
        }
        competition.regenerateInviteCode();
        return CompetitionDetailResponse.from(competition);
    }

    public List<CompetitionListResponse> getVisitedCompetitions(Long userId) {
        List<Competition> competitions = competitionRepository.findVisitedPrivateCompetitions(userId);
        return competitions.stream()
                .map(CompetitionListResponse::from)
                .collect(Collectors.toList());
    }

    private Competition findActiveCompetition(Long id) {
        return competitionRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Competition not found: " + id));
    }
}
