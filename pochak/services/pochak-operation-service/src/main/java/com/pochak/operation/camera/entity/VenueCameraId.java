package com.pochak.operation.camera.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode
public class VenueCameraId implements Serializable {

    @Column(name = "venue_id")
    private Long venueId;

    @Column(name = "camera_id")
    private Long cameraId;
}
