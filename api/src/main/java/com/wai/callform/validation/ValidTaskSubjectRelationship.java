package com.wai.callform.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that the subject is valid for the selected task.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = TaskSubjectValidator.class)
@Documented
public @interface ValidTaskSubjectRelationship {

    String message() default "Subject must be valid for the selected task";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}