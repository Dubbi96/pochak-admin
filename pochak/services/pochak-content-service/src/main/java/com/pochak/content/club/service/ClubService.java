package com.pochak.content.club.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.club.dto.*;
import com.pochak.content.club.entity.ClubCustomization;
import com.pochak.content.club.repository.ClubCustomizationRepository;
import com.pochak.content.membership.dto.MembershipResponse;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.organization.entity.Organization;
import com.pochak.content.organization.repository.OrganizationRepository;
import com.pochak.content.team.entity.Team;
import com.pochak.content.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClubService {

    private final TeamRepository teamRepository;
    private final MembershipRepository membershipRepository;
    private final OrganizationRepository organizationRepository;
    private final ClipAssetRepository clipAssetRepository;
    private final VodAssetRepository vodAssetRepository;
    private final ClubCustomizationRepository clubCustomizationRepository;

    private static final BigDecimal DEFAULT_RADIUS_DEGREE = new BigDecimal("0.05"); // ~5km

    public Page<ClubListResponse> getNearbyClubs(Long sportId, String siGunGuCode,
                                                  BigDecimal lat, BigDecimal lng,
                                                  Pageable pageable) {
        Page<Team> teams;

        if (siGunGuCode != null) {
            teams = teamRepository.findNearbyBySiGunGuCode(sportId, siGunGuCode, pageable);
        } else if (lat != null && lng != null) {
            BigDecimal minLat = lat.subtract(DEFAULT_RADIUS_DEGREE);
            BigDecimal maxLat = lat.add(DEFAULT_RADIUS_DEGREE);
            BigDecimal minLng = lng.subtract(DEFAULT_RADIUS_DEGREE);
            BigDecimal maxLng = lng.add(DEFAULT_RADIUS_DEGREE);
            teams = teamRepository.findNearbyByLatLng(sportId, minLat, maxLat, minLng, maxLng, pageable);
        } else {
            teams = teamRepository.findNearbyBySiGunGuCode(sportId, null, pageable);
        }

        return teams.map(team -> {
            long count = getApprovedMemberCount(team.getId());
            return ClubListResponse.from(team, count);
        });
    }

    public Page<ClubListResponse> getPopularClubs(Pageable pageable) {
        List<Object[]> popularIds = membershipRepository.findPopularTargetIds(
                Membership.TargetType.TEAM, pageable);

        List<ClubListResponse> results = new ArrayList<>();
        for (Object[] row : popularIds) {
            Long teamId = (Long) row[0];
            Long count = (Long) row[1];
            teamRepository.findByIdAndActiveTrue(teamId).ifPresent(team ->
                    results.add(ClubListResponse.from(team, count)));
        }

        return new org.springframework.data.domain.PageImpl<>(results, pageable, results.size());
    }

    public Page<ClubListResponse> getRecentClubs(Pageable pageable) {
        Page<Team> teams = teamRepository.findRecentTeams(pageable);
        return teams.map(team -> {
            long count = getApprovedMemberCount(team.getId());
            return ClubListResponse.from(team, count);
        });
    }

    public ClubDetailResponse getClubDetail(Long teamId) {
        Team team = teamRepository.findByIdAndActiveTrue(teamId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Team not found: " + teamId));

        Organization org = null;
        if (team.getOrganizationId() != null) {
            org = organizationRepository.findByIdAndActiveTrue(team.getOrganizationId()).orElse(null);
        }

        long memberCount = getApprovedMemberCount(teamId);
        List<ClubDetailResponse.RecentContentItem> recentContent = getRecentContent(teamId);
        ClubCustomization customization = clubCustomizationRepository.findByClubId(teamId).orElse(null);

        return ClubDetailResponse.from(team, org, memberCount, recentContent, customization);
    }

    public ClubCustomizationResponse getClubCustomization(Long clubId, Long partnerId) {
        teamRepository.findByIdAndActiveTrue(clubId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Club not found: " + clubId));

        ClubCustomization customization = clubCustomizationRepository
                .findByClubIdAndPartnerId(clubId, partnerId)
                .orElse(null);

        if (customization == null) {
            return ClubCustomizationResponse.builder()
                    .clubId(clubId)
                    .partnerId(partnerId)
                    .build();
        }
        return ClubCustomizationResponse.from(customization);
    }

    @Transactional
    public ClubCustomizationResponse upsertClubCustomization(Long clubId, UpdateClubCustomizationRequest request) {
        teamRepository.findByIdAndActiveTrue(clubId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Club not found: " + clubId));

        ClubCustomization customization = clubCustomizationRepository
                .findByClubIdAndPartnerId(clubId, request.getPartnerId())
                .orElse(null);

        if (customization == null) {
            customization = ClubCustomization.builder()
                    .clubId(clubId)
                    .partnerId(request.getPartnerId())
                    .bannerUrl(request.getBannerUrl())
                    .logoUrl(request.getLogoUrl())
                    .themeColor(request.getThemeColor())
                    .introText(request.getIntroText())
                    .sectionsJson(request.getSectionsJson())
                    .socialLinksJson(request.getSocialLinksJson())
                    .build();
        } else {
            customization.update(
                    request.getBannerUrl(),
                    request.getLogoUrl(),
                    request.getThemeColor(),
                    request.getIntroText(),
                    request.getSectionsJson(),
                    request.getSocialLinksJson()
            );
        }

        return ClubCustomizationResponse.from(clubCustomizationRepository.save(customization));
    }

    @Transactional
    public MembershipResponse joinClub(Long teamId, JoinClubRequest request) {
        Team team = teamRepository.findByIdAndActiveTrue(teamId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Team not found: " + teamId));

        if (membershipRepository.existsByUserIdAndTargetTypeAndTargetId(
                request.getUserId(), Membership.TargetType.TEAM, teamId)) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Already a member or pending join request");
        }

        Membership.MembershipRole role = Membership.MembershipRole.PLAYER;
        if (request.getRole() != null) {
            try {
                role = Membership.MembershipRole.valueOf(request.getRole());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid role: " + request.getRole());
            }
        }

        Membership membership = Membership.builder()
                .userId(request.getUserId())
                .targetType(Membership.TargetType.TEAM)
                .targetId(teamId)
                .role(role)
                .nickname(request.getNickname())
                .joinType(Membership.JoinType.REQUEST)
                .approvalStatus(Membership.ApprovalStatus.PENDING)
                .build();

        Membership saved = membershipRepository.save(membership);
        return MembershipResponse.from(saved);
    }

    public List<ClubMemberResponse> getClubMembers(Long teamId) {
        teamRepository.findByIdAndActiveTrue(teamId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Team not found: " + teamId));

        List<Membership> members = membershipRepository
                .findByTargetTypeAndTargetIdAndActiveTrueAndApprovalStatus(
                        Membership.TargetType.TEAM, teamId, Membership.ApprovalStatus.APPROVED);

        return members.stream().map(ClubMemberResponse::from).toList();
    }

    private long getApprovedMemberCount(Long teamId) {
        return membershipRepository.countByTargetTypeAndTargetIdAndApprovalStatusAndActiveTrue(
                Membership.TargetType.TEAM, teamId, Membership.ApprovalStatus.APPROVED);
    }

    private List<ClubDetailResponse.RecentContentItem> getRecentContent(Long teamId) {
        List<ClubDetailResponse.RecentContentItem> items = new ArrayList<>();
        Pageable limit5 = PageRequest.of(0, 5);

        try {
            List<ClipAsset> clips = clipAssetRepository.findPopularClips(limit5);
            for (ClipAsset clip : clips) {
                if (items.size() >= 5) break;
                items.add(ClubDetailResponse.RecentContentItem.builder()
                        .id(clip.getId())
                        .type("CLIP")
                        .title(clip.getTitle())
                        .thumbnailUrl(clip.getThumbnailUrl())
                        .createdAt(clip.getCreatedAt())
                        .build());
            }
        } catch (Exception ignored) {
            // Gracefully handle if no content exists
        }

        try {
            List<VodAsset> vods = vodAssetRepository.findRecentVods(limit5);
            for (VodAsset vod : vods) {
                if (items.size() >= 5) break;
                items.add(ClubDetailResponse.RecentContentItem.builder()
                        .id(vod.getId())
                        .type("VOD")
                        .title(vod.getTitle())
                        .thumbnailUrl(vod.getThumbnailUrl())
                        .createdAt(vod.getCreatedAt())
                        .build());
            }
        } catch (Exception ignored) {
            // Gracefully handle if no content exists
        }

        return items;
    }
}
