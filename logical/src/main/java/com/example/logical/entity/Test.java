package com.example.logical.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "test")
@Data
@NoArgsConstructor
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "test_seq")
    @SequenceGenerator(name = "test_seq", sequenceName = "test_seq", allocationSize = 1)
    private Long test_id;

    private String test_name;

    @OneToMany(mappedBy = "test")
    private List<Test_question> test_questions;

    @OneToMany(mappedBy = "test")
    private List<Course_test> course_tests;

    @OneToMany(mappedBy = "test")
    private List<User_test_assessment> user_test_assessments;
}
