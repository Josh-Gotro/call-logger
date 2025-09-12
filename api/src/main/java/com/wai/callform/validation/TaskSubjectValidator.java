package com.wai.callform.validation;

import com.wai.callform.entity.CallEntry;
import com.wai.callform.service.TaskSubjectService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Validates that the subject is valid for the selected task in a CallEntry.
 */
@Component
@RequiredArgsConstructor
public class TaskSubjectValidator implements ConstraintValidator<ValidTaskSubjectRelationship, CallEntry> {

    private final TaskSubjectService taskSubjectService;

    @Override
    public void initialize(ValidTaskSubjectRelationship constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(CallEntry callEntry, ConstraintValidatorContext context) {
        if (callEntry == null) {
            return true; // Let @NotNull handle null checks
        }

        // If no task or subject is selected, that's valid
        if (callEntry.getTask() == null || callEntry.getSubject() == null) {
            return true;
        }

        // If both task and subject are selected, validate the relationship
        boolean isValid = taskSubjectService.isSubjectValidForTask(
                callEntry.getTask().getId(),
                callEntry.getSubject().getId());

        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Selected subject '" + callEntry.getSubject().getName() +
                            "' is not valid for task '" + callEntry.getTask().getName() + "'")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}