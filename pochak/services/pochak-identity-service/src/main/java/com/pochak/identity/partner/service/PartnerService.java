package com.pochak.identity.partner.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.partner.dto.PartnerResponse;
import com.pochak.identity.partner.dto.RegisterPartnerRequest;
import com.pochak.identity.partner.entity.Partner;
import com.pochak.identity.partner.entity.PartnerStatus;
import com.pochak.identity.partner.repository.PartnerRepository;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerService {

    private final PartnerRepository partnerRepository;
    private final UserRepository userRepository;

    @Transactional
    public PartnerResponse register(Long userId, RegisterPartnerRequest request) {
        if (partnerRepository.existsByUserId(userId)) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Partner already registered for this user");
        }

        if (partnerRepository.existsByBusinessNumber(request.getBusinessNumber())) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "Business number already registered: " + request.getBusinessNumber());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found: " + userId));

        Partner partner = Partner.builder()
                .userId(userId)
                .businessName(request.getBusinessName())
                .businessNumber(request.getBusinessNumber())
                .contactPhone(request.getContactPhone())
                .bankAccount(request.getBankAccount())
                .bankName(request.getBankName())
                .build();

        Partner saved = partnerRepository.save(partner);
        log.info("Partner registered: id={}, userId={}, businessName={}", saved.getId(), userId, request.getBusinessName());

        return PartnerResponse.from(saved);
    }

    public PartnerResponse getMyPartnerInfo(Long userId) {
        Partner partner = partnerRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Partner not found for user: " + userId));
        return PartnerResponse.from(partner);
    }

    @Transactional
    public PartnerResponse approve(Long partnerId) {
        Partner partner = findById(partnerId);

        if (partner.getStatus() != PartnerStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Partner can only be approved from PENDING status, current: " + partner.getStatus());
        }

        partner.approve();

        User user = userRepository.findById(partner.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found: " + partner.getUserId()));
        user.updateRole(User.UserRole.PARTNER);

        log.info("Partner approved: id={}, userId={}", partnerId, partner.getUserId());
        return PartnerResponse.from(partner);
    }

    public Page<PartnerResponse> getPartnersByStatus(PartnerStatus status, Pageable pageable) {
        return partnerRepository.findByStatus(status, pageable)
                .map(PartnerResponse::from);
    }

    private Partner findById(Long id) {
        return partnerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Partner not found: " + id));
    }
}
