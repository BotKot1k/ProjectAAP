package com.example.logical.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends RuntimeException{
    public ConflictException(String resourceName, String field, String value) {
        super(resourceName + " with " + field + " '" + value + "' already exists");
    }
    public ConflictException(String resourceName, String field, Long value) {
        super(resourceName + " with " + field + " '" + value + "' already exists");
    }

}
