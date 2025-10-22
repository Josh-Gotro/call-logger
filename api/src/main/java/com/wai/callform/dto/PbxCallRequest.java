package com.wai.callform.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class PbxCallRequest {

    @NotBlank(message = "Phone number is required")
    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    private String phoneNumber;

    @NotNull(message = "Call duration is required")
    private Integer callDuration;  // in seconds

    @NotBlank(message = "Call owner extension is required")
    @Size(max = 20, message = "Extension must not exceed 20 characters")
    private String callOwnerExtension;

    @Email(message = "Call owner email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String callOwnerEmail;

    @NotNull(message = "Call direction is required")
    private CallDirection callDirection;

    @Size(max = 100, message = "Call group ID must not exceed 100 characters")
    private String callGroupId;

    @NotNull(message = "Timestamp is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime timestamp;

    @NotBlank(message = "PBX call ID is required")
    @Size(max = 100, message = "PBX call ID must not exceed 100 characters")
    private String pbxCallId;

    public enum CallDirection {
        INBOUND,
        OUTBOUND
    }
}
