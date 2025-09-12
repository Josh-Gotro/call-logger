package com.wai.callform.repository;

import com.wai.callform.entity.ProgramManagementItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProgramManagementItemRepository extends JpaRepository<ProgramManagementItem, UUID> {

    // Find all active items ordered by sort order
    List<ProgramManagementItem> findByIsActiveTrueOrderBySortOrderAscNameAsc();

    // Find top-level parent items (no parent)
    @Query("SELECT p FROM ProgramManagementItem p WHERE p.parent IS NULL AND p.isActive = true ORDER BY p.sortOrder ASC, p.name ASC")
    List<ProgramManagementItem> findTopLevelParents();

    // Find children of a specific parent
    @Query("SELECT p FROM ProgramManagementItem p WHERE p.parent.id = :parentId AND p.isActive = true ORDER BY p.sortOrder ASC, p.name ASC")
    List<ProgramManagementItem> findActiveChildrenByParentId(@Param("parentId") UUID parentId);

    // Find all children of a specific parent (including inactive)
    List<ProgramManagementItem> findByParentIdOrderBySortOrderAscNameAsc(UUID parentId);

    // Check if an item has any children
    @Query("SELECT COUNT(p) > 0 FROM ProgramManagementItem p WHERE p.parent.id = :parentId")
    boolean hasChildren(@Param("parentId") UUID parentId);

    // Check if an item has any active children
    @Query("SELECT COUNT(p) > 0 FROM ProgramManagementItem p WHERE p.parent.id = :parentId AND p.isActive = true")
    boolean hasActiveChildren(@Param("parentId") UUID parentId);

    // Find all parent items that have children
    @Query("SELECT DISTINCT p.parent FROM ProgramManagementItem p WHERE p.parent IS NOT NULL AND p.parent.isActive = true ORDER BY p.parent.sortOrder ASC, p.parent.name ASC")
    List<ProgramManagementItem> findParentsWithChildren();

    // Find all items by name (case-insensitive search)
    @Query("SELECT p FROM ProgramManagementItem p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.isActive = true ORDER BY p.sortOrder ASC, p.name ASC")
    List<ProgramManagementItem> findByNameContainingIgnoreCase(@Param("name") String name);

    // Validate parent-child relationship
    @Query("SELECT COUNT(p) > 0 FROM ProgramManagementItem p WHERE p.id = :childId AND p.parent.id = :parentId")
    boolean isValidParentChildRelationship(@Param("parentId") UUID parentId, @Param("childId") UUID childId);
}