package com.wai.callform.validation;

import com.wai.callform.entity.CallEntry;
import com.wai.callform.entity.ProgramManagementItem;
import com.wai.callform.repository.ProgramManagementItemRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProgramManagementHierarchyValidator implements ConstraintValidator<ValidProgramManagementHierarchy, CallEntry> {

    private final ProgramManagementItemRepository programManagementItemRepository;

    @Override
    public void initialize(ValidProgramManagementHierarchy constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(CallEntry callEntry, ConstraintValidatorContext context) {
        if (callEntry == null) {
            return true; // Let @NotNull handle null checks
        }

        ProgramManagementItem parent = callEntry.getProgramManagementParent();
        ProgramManagementItem child = callEntry.getProgramManagementChild();

        // If no program management is selected, that's valid
        if (parent == null && child == null) {
            return true;
        }

        // If child is selected but no parent, that's invalid
        if (child != null && parent == null) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Child program management item requires a parent to be selected"
            ).addConstraintViolation();
            return false;
        }

        // If parent is selected but no child, check if parent requires a child
        if (parent != null && child == null) {
            // Check if the parent has children - if so, child selection is required
            if (programManagementItemRepository.hasActiveChildren(parent.getId())) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "Selected program management item '" + parent.getName() + "' requires a child selection"
                ).addConstraintViolation();
                return false;
            }
            return true; // Parent without children is valid
        }

        // If both parent and child are selected, validate the relationship
        if (parent != null && child != null) {
            // Verify that child is actually a child of the selected parent
            if (!programManagementItemRepository.isValidParentChildRelationship(parent.getId(), child.getId())) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "Selected child '" + child.getName() + "' is not a valid child of parent '" + parent.getName() + "'"
                ).addConstraintViolation();
                return false;
            }
        }

        return true;
    }
}