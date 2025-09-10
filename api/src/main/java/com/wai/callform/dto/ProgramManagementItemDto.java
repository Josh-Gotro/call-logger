package com.wai.callform.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ProgramManagementItemDto {
    private UUID id;
    private String name;
    private UUID parentId;
    private String parentName;
    private List<ProgramManagementItemDto> children;
    private boolean hasChildren;
    private boolean active;
    private Integer sortOrder;
}