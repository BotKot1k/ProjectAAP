package com.example.logical.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_test_assessment")
@Data
@NoArgsConstructor
public class User_test_assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_test_assessment_seq")
    @SequenceGenerator(name = "user_test_assessment_seq", sequenceName = "user_test_assessment_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;

    private int test_assessment;

    private Integer[] user_answers;

    private int try_test;
}
