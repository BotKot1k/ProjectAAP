package com.example.logical.entity;

import com.example.logical.dto.CourseDTO;
import com.example.logical.repositories.UserRepository;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Entity
@Table(name = "course")
@Data
@NoArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_seq")
    @SequenceGenerator(name = "course_seq", sequenceName = "course_seq", allocationSize = 1)
    @Column(name ="course_id")
    private long courseId;

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
