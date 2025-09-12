package com.wai.callform.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class CallEntryDto {
    private UUID id;

    @NotBlank(message = "DataTech name is required")
    @Size(max = 255, message = "DataTech name must not exceed 255 characters")
    private String datatechName;

    @NotBlank(message = "DataTech email is required")
    @Email(message = "DataTech email must be valid")
    @Size(max = 255, message = "DataTech email must not exceed 255 characters")
    private String datatechEmail;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime endTime;

    private Boolean isInbound;
    private Boolean isAgent;

    // Task and Subject references
    private UUID taskId;
    private String taskName;
    
    private UUID subjectId;
    private String subjectName;
    
    // Display field for UI
    private String taskSubjectDisplay;

    private String comments;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime updatedAt;

    // Computed fields for UI
    private boolean inProgress;
    private boolean completed;
    private Long durationMinutes;
}