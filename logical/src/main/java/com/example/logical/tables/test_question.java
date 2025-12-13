package com.example.logical.tables;

import jakarta.persistence.*;

@Entity
@Table(name = "test_question")
public class test_question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int test_id;

    private int[] question_id;
}
