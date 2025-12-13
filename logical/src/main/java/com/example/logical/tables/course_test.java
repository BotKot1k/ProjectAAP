package com.example.logical.tables;

import jakarta.persistence.*;

@Entity
@Table(name = "course_test")
public class course_test {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private int course_id;

    private int test_id;
}
