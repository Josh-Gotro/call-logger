package com.wai.callform.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
public class ReportRequest {
    
    @NotNull(message = "Report type is required")
    private String reportType;  // LIVE, ASYNC_USER, ASYNC_TEAM, ASYNC_FULL

    @NotBlank(message = "Requested by is required")
    private String requestedBy;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime startDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime endDate;

    private String userEmail;
    private String taskName;
    private String subjectName;

    // Additional parameters for flexible filtering
    private Map<String, Object> additionalFilters;
}