package com.wai.callform.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class SubjectItemDto {
    private UUID id;
    private String name;
    private boolean active;
    private Integer sortOrder;
}