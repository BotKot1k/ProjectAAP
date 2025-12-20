package com.example.logical.services;

import com.example.logical.dto.CourseDTO;
import com.example.logical.repositories.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public CourseDTO getCourseById(Long current_id, Long id) {
         if(!courseRepository.existsById(id)){
             
         }

    }
}
