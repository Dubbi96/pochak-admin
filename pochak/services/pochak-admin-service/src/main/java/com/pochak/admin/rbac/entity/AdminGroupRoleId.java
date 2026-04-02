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
public class AdminGroupRoleId implements Serializable {

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "role_id")
    private Long roleId;
}
