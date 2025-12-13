package com.example.logical.tables;

import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int user_id;

    private int course_id;

}
