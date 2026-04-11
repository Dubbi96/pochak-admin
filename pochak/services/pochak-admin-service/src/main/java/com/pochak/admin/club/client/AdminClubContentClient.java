package com.pochak.admin.club.client;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Map;

public interface AdminClubContentClient {

    JsonNode listClubs(Map<String, String> params);

    JsonNode getClub(Long clubId);

    JsonNode updateClubStatus(Long clubId, String status);

    JsonNode getClubMembers(Long clubId);
}
