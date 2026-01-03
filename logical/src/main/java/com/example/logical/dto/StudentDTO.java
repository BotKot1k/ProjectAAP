package com.example.logical.dto;

import com.example.logical.entity.Course;
import com.example.logical.entity.Users;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StudentDTO {
    private Long id;
    private Long user_id;
    private Long course_id;
}
