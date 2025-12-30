package com.example.logical.dto;

import com.example.logical.entity.Student;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class User_test_assessmentDTO {
    private Long id;
    private StudentDTO student;
    private CourseDTO course;
    private TestDTO test;
    private int test_assessment;
    private Integer[] user_answers;
    private int try_test;
}
