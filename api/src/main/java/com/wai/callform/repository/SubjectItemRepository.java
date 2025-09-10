package com.wai.callform.repository;

import com.wai.callform.entity.SubjectItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectItemRepository extends JpaRepository<SubjectItem, UUID> {

    // Find all active subjects ordered by sort order and name
    List<SubjectItem> findByIsActiveTrueOrderBySortOrderAscNameAsc();

    // Find all subjects (including inactive) ordered by sort order and name
    List<SubjectItem> findAllByOrderBySortOrderAscNameAsc();

    // Find subject by exact name (case-insensitive)
    @Query("SELECT s FROM SubjectItem s WHERE LOWER(s.name) = LOWER(:name)")
    Optional<SubjectItem> findByNameIgnoreCase(@Param("name") String name);

    // Find subjects by partial name match (case-insensitive)
    @Query("SELECT s FROM SubjectItem s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')) AND s.isActive = true ORDER BY s.sortOrder ASC, s.name ASC")
    List<SubjectItem> findByNameContainingIgnoreCase(@Param("name") String name);

    // Check if subject name exists (for uniqueness validation)
    @Query("SELECT COUNT(s) > 0 FROM SubjectItem s WHERE LOWER(s.name) = LOWER(:name) AND s.id != :excludeId")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("excludeId") UUID excludeId);

    // Check if subject name exists (for creation validation)
    @Query("SELECT COUNT(s) > 0 FROM SubjectItem s WHERE LOWER(s.name) = LOWER(:name)")
    boolean existsByNameIgnoreCase(@Param("name") String name);

    // Find the maximum sort order for new item placement
    @Query("SELECT COALESCE(MAX(s.sortOrder), 0) FROM SubjectItem s")
    Integer findMaxSortOrder();
}