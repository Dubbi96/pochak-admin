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
public class AdminGroupUserId implements Serializable {

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "admin_user_id")
    private Long adminUserId;
}
