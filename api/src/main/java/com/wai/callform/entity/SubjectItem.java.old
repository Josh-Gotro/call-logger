package com.wai.callform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "subject_items")
@Data
@EqualsAndHashCode(of = "id")
public class SubjectItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Subject name is required")
    @Size(max = 100, message = "Subject name cannot exceed 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}