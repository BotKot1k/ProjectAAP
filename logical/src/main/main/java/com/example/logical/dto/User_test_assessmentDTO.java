package com.example.logical.dto;

import com.example.logical.entity.Student;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class User_test_assessmentDTO {
    private Long id;
    private Long student_id;
    private Long course_id;
    private Long test_id;
    private int test_assessment;
    private Integer[] user_answers;
    private int try_test;
    private boolean test_is_active;
}
