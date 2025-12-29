package com.example.logical.entity;

import com.example.logical.dto.CourseDTO;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "course")
@Data
@NoArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_seq")
    @SequenceGenerator(name = "course_seq", sequenceName = "course_seq", allocationSize = 1)
    private long course_id;

    private String course_name;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Users teacher;

    private String description;

    @OneToMany(mappedBy = "course")
    private List<Course_test> course_tests;

    @OneToMany(mappedBy = "course")
    private List<Student> students;

    @OneToMany(mappedBy = "course")
    private List<User_test_assessment> user_test_assessments;

    public Course(CourseDTO courseDTO) {
        this.course_id = courseDTO.getCourse_id();
        this.course_name = courseDTO.getCourse_name();
        this.description = courseDTO.getDescription();
        this.teacher = new Users(courseDTO.getTeacher_id());
    }
}
