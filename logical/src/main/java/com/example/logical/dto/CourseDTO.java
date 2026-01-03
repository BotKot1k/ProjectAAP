package com.example.logical.dto;


import com.example.logical.entity.Course;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CourseDTO {
    private Long course_id;
    private String course_name;
    private Long teacher_id;
    private String description;

    public CourseDTO(Course course) {
        this.course_id = course.getCourseId();
        this.course_name = course.getCourse_name();
        this.teacher_id = course.getTeacher().getUserId();
        this.description = course.getDescription();
    }
}
