package com.wai.callform.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCallRequest {
    
    private String isInbound;  // "yes", "no", or null

    @Size(max = 100, message = "Program management must not exceed 100 characters")
    private String programManagement;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;

    private String isAgent;  // "yes", "no", or null

    private String comments;
}