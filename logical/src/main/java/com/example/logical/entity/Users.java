package com.example.logical.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    private String user_firstname;

    private String user_lastname;

    private String user_patronymic;

    private String[] user_rank;

    @OneToMany(mappedBy = "teacher")
    private List<Course> teachers;

    @OneToMany(mappedBy = "user")
    private List<Student> students;


}
