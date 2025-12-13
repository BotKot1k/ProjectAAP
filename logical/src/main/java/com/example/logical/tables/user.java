package com.example.logical.tables;

import jakarta.persistence.*;

@Entity
@Table(name = "user")
public class user {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long user_id;

    private String user_firstname;

    private String user_last_name;

    private String user_patronymic;
}
