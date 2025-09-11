package com.wai.callform.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class UpdateCallRequest {
    
    private Boolean isInbound;

    private String programManagementParentId;
    
    private String programManagementChildId;

    private String categoryId;

    private String subjectId;

    private Boolean isAgent;

    private String comments;
    
    private OffsetDateTime startTime;
    
    private OffsetDateTime endTime;
}