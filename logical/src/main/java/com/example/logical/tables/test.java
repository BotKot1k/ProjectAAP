package com.example.logical.tables;

import jakarta.persistence.*;

@Entity
@Table(name = "test")
public class test {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int test_id;

    private String test_name;
}
