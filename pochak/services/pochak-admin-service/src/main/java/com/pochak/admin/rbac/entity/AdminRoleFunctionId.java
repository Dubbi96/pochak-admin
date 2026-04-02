package com.pochak.admin.rbac.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode
public class AdminRoleFunctionId implements Serializable {

    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "function_id")
    private Long functionId;
}
