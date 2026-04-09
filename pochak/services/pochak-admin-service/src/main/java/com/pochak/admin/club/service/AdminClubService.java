package com.pochak.admin.club.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.club.client.AdminClubContentClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminClubService {

    private final AdminClubContentClient contentClient;
    private final AuditLogService auditLogService;

    public JsonNode listClubs(Map<String, String> params) {
        return contentClient.listClubs(params);
    }

    public JsonNode getClub(Long clubId) {
        return contentClient.getClub(clubId);
    }

    public JsonNode updateClubStatus(Long clubId, String status, Long adminUserId,
                                      String ipAddress, String userAgent) {
        JsonNode result = contentClient.updateClubStatus(clubId, status);

        auditLogService.log(
                adminUserId,
                "UPDATE_CLUB_STATUS",
                "Club",
                String.valueOf(clubId),
                "{\"status\":\"" + status + "\"}",
                ipAddress,
                userAgent
        );

        log.info("Admin {} changed club {} status to {}", adminUserId, clubId, status);
        return result;
    }

    public JsonNode getClubMembers(Long clubId) {
        return contentClient.getClubMembers(clubId);
    }
}
