package com.wai.callform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StartCallRequest {
    
    @NotBlank(message = "DataTech name is required")
    @Size(max = 255, message = "DataTech name must not exceed 255 characters")
    private String datatechName;

    @NotBlank(message = "DataTech email is required")
    @Email(message = "DataTech email must be valid")
    @Size(max = 255, message = "DataTech email must not exceed 255 characters")
    private String datatechEmail;
}