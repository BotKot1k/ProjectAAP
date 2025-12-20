package com.example.logical.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "course_test")
@Data
@NoArgsConstructor
public class Course_test {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_test_seq")
    @SequenceGenerator(name = "course_test_seq", sequenceName = "course_test_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;

    private boolean course_test_active;
}
