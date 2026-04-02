package com.pochak.admin.rbac.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_functions", schema = "admin")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class AdminFunction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "function_code", nullable = false, unique = true)
    private String functionCode;

    @Column(name = "function_name", nullable = false)
    private String functionName;

    @Column(name = "http_method")
    private String httpMethod;

    @Column(name = "api_path")
    private String apiPath;

    private String description;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateInfo(String functionName, String httpMethod, String apiPath, String description) {
        if (functionName != null) this.functionName = functionName;
        if (httpMethod != null) this.httpMethod = httpMethod;
        if (apiPath != null) this.apiPath = apiPath;
        if (description != null) this.description = description;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
