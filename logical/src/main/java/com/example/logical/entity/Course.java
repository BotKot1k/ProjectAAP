package com.example.logical.entity;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
}
