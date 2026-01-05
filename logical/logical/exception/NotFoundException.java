package com.example.logical.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundException extends RuntimeException{
    public NotFoundException(String resourceName, String message) {

        super(resourceName + "not found: "+ message);
    }

    public NotFoundException(String resourceName, Long id) {
        super(resourceName +"not found: "+ id);
    }
}
