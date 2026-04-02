package com.pochak.content.acl.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetAclRequest {

    @NotNull
    private String defaultPolicy;

    private Map<String, Object> policy;
}
