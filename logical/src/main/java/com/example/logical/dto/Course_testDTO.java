package com.example.logical.dto;

import com.example.logical.entity.Users;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Course_testDTO {
    private Long course_id;
    private String course_name;
    private String description;
    private UsersDTO teacher;
}
