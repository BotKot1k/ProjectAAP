package com.example.logical.tables;

import jakarta.persistence.*;

@Entity
@Table(name = "user_test_assessment")
public class user_test_assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int user_id;

    private int course_id;

    private int test_id;

    private int test_assessment;
}
