package com.wai.callform.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ProgramManagementHierarchyValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidProgramManagementHierarchy {
    
    String message() default "Invalid program management hierarchy: child selection requires valid parent";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}