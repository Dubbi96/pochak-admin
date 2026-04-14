package com.pochak.operation.skylife.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "camera_hub_units", schema = "operation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class CameraHubUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "mac_address", unique = true, nullable = false, length = 17)
    private String macAddress;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ChuStatus status = ChuStatus.DISCONNECTED;

    @Column(name = "firmware_version", length = 50)
    private String firmwareVersion;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "last_connected_at")
    private LocalDateTime lastConnectedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public void connect() {
        this.status = ChuStatus.CONNECTED;
        this.lastConnectedAt = LocalDateTime.now();
    }

    public void disconnect() {
        this.status = ChuStatus.DISCONNECTED;
    }
}
