package com.wai.callform.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class CallGroupAlertDto {

    private UUID id;

    @NotBlank(message = "Call group ID is required")
    @Size(max = 100, message = "Call group ID must not exceed 100 characters")
    private String callGroupId;

    @Size(max = 255, message = "Call group name must not exceed 255 characters")
    private String callGroupName;

    @NotBlank(message = "Alert type is required")
    @Size(max = 50, message = "Alert type must not exceed 50 characters")
    private String alertType;

    private String alertMessage;

    private Boolean isActive;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime resolvedAt;
}
