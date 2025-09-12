package com.wai.callform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "program_management_items")
@Data
@EqualsAndHashCode(of = "id")
public class ProgramManagementItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Program management name is required")
    @Size(max = 100, message = "Program management name cannot exceed 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ProgramManagementItem parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProgramManagementItem> children = new ArrayList<>();

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    public boolean hasChildren() {
        return children != null && !children.isEmpty();
    }

    public boolean isParent() {
        return parent == null;
    }

    public boolean isChild() {
        return parent != null;
    }
}