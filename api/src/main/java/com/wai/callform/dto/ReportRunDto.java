package com.wai.callform.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
public class ReportRunDto {
    private UUID id;
    private String requestedBy;
    private String status;
    private String reportType;
    private Map<String, Object> parameters;
    private String resultUrl;
    private String errorMessage;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime startedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime completedAt;

    // Computed fields
    private boolean inProgress;
    private boolean completed;
    private boolean failed;
    private Long processingTimeMinutes;
}