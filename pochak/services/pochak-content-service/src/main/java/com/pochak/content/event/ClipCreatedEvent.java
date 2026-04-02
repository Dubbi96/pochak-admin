package com.pochak.content.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

@Getter
public class ClipCreatedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long clipId;
    private final Long sourceContentId;
    private final Long creatorUserId;

    public ClipCreatedEvent(Long clipId, Long sourceContentId, Long creatorUserId) {
        super(String.valueOf(clipId));
        this.clipId = clipId;
        this.sourceContentId = sourceContentId;
        this.creatorUserId = creatorUserId;
    }
}
