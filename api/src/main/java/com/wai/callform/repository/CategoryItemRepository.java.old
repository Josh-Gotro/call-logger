package com.wai.callform.repository;

import com.wai.callform.entity.CategoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryItemRepository extends JpaRepository<CategoryItem, UUID> {

    // Find all active categories ordered by sort order and name
    List<CategoryItem> findByIsActiveTrueOrderBySortOrderAscNameAsc();

    // Find all categories (including inactive) ordered by sort order and name
    List<CategoryItem> findAllByOrderBySortOrderAscNameAsc();

    // Find category by exact name (case-insensitive)
    @Query("SELECT c FROM CategoryItem c WHERE LOWER(c.name) = LOWER(:name)")
    Optional<CategoryItem> findByNameIgnoreCase(@Param("name") String name);

    // Find categories by partial name match (case-insensitive)
    @Query("SELECT c FROM CategoryItem c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')) AND c.isActive = true ORDER BY c.sortOrder ASC, c.name ASC")
    List<CategoryItem> findByNameContainingIgnoreCase(@Param("name") String name);

    // Check if category name exists (for uniqueness validation)
    @Query("SELECT COUNT(c) > 0 FROM CategoryItem c WHERE LOWER(c.name) = LOWER(:name) AND c.id != :excludeId")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("excludeId") UUID excludeId);

    // Check if category name exists (for creation validation)
    @Query("SELECT COUNT(c) > 0 FROM CategoryItem c WHERE LOWER(c.name) = LOWER(:name)")
    boolean existsByNameIgnoreCase(@Param("name") String name);

    // Find the maximum sort order for new item placement
    @Query("SELECT COALESCE(MAX(c.sortOrder), 0) FROM CategoryItem c")
    Integer findMaxSortOrder();
}