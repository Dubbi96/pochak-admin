package com.pochak.common.security;

import com.pochak.common.constant.HeaderConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class UserContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String userIdHeader = request.getHeader(HeaderConstants.X_USER_ID);
            String userRoleHeader = request.getHeader(HeaderConstants.X_USER_ROLE);

            if (userIdHeader != null && !userIdHeader.isBlank()) {
                UserContext context = UserContext.builder()
                        .userId(Long.parseLong(userIdHeader))
                        .role(userRoleHeader)
                        .build();
                UserContextHolder.set(context);
            }

            filterChain.doFilter(request, response);
        } finally {
            UserContextHolder.clear();
        }
    }
}
