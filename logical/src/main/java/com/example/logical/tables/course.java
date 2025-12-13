package com.example.logical.tables;

import jakarta.persistence.*;

@Entity
@Table(name = "course")
public class course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long course_id;

    private String course_name;

    private int teacher_id;

    private String description;
}
