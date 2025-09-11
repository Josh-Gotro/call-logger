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

    @Size(max = 100, message = "Program management must not exceed 100 characters")
    private String programManagement;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;

    private Boolean isAgent;

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