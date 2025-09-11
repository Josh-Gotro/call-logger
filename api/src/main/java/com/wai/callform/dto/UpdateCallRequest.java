package com.wai.callform.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class UpdateCallRequest {
    
    private Boolean isInbound;

    @Size(max = 100, message = "Program management must not exceed 100 characters")
    private String programManagement;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;

    private Boolean isAgent;

    private String comments;
    
    private OffsetDateTime startTime;
    
    private OffsetDateTime endTime;
}