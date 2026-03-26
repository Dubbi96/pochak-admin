package com.pochak.content.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

@Getter
public class ContentPublishedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long contentId;
    private final String contentType;
    private final String title;
    private final String sportCode;

    public ContentPublishedEvent(Long contentId, String contentType, String title, String sportCode) {
        super(String.valueOf(contentId));
        this.contentId = contentId;
        this.contentType = contentType;
        this.title = title;
        this.sportCode = sportCode;
    }
}
