package com.example.logical.dto;

import com.example.logical.entity.Course;
import com.example.logical.entity.Users;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StudentDTO {
    private Long id;
    private UsersDTO  user;
    private CourseDTO course;
}
