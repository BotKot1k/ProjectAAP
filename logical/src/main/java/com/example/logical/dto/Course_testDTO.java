package com.example.logical.dto;

import com.example.logical.entity.Course_test;
import com.example.logical.entity.Users;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Course_testDTO {
    private Long course_id;
    private Long test_id;
    private boolean course_test_active;

    public Course_testDTO(Long course_id, Long test_id){
        this.course_id = course_id;
        this.test_id = test_id;
        this.course_test_active = true;
    }
}
