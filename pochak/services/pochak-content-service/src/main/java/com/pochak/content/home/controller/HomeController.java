package com.pochak.content.home.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.home.dto.HomeResponse;
import com.pochak.content.home.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping
    public ApiResponse<HomeResponse> getHome() {
        HomeResponse response = homeService.getHome();
        return ApiResponse.success(response);
    }
}
