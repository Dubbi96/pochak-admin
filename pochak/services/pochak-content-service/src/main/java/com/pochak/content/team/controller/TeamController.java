package com.pochak.content.team.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.team.entity.Team;
import com.pochak.content.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamRepository teamRepository;

    @GetMapping
    public ApiResponse<List<Team>> getTeamsBySport(@RequestParam Long sportId) {
        return ApiResponse.success(teamRepository.findBySportIdAndActiveTrue(sportId));
    }

    @GetMapping("/{id}")
    public ApiResponse<Team> getTeamById(@PathVariable Long id) {
        return ApiResponse.success(teamRepository.findById(id).orElse(null));
    }
}
