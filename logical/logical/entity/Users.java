package com.example.logical.entity;

import com.example.logical.dto.UsersDTO;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "users_seq")
    @SequenceGenerator(name = "users_seq", sequenceName = "users_seq", allocationSize = 1)
    @Column(name = "user_id")
    private Long userId;

    private String user_firstname;

    private String user_lastname;

    private String user_patronymic;

    private Set<String> user_rank;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.REMOVE)
    private List<Course> teachers;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    private List<Student> students;

}
