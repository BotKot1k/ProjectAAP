package com.example.logical.entity;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.List;

@Entity
@Table(name = "student")
@Data
@NoArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "student_seq")
    @SequenceGenerator(name = "student_seq", sequenceName = "student_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @OneToMany(mappedBy = "student")
    private List<User_test_assessment> user_test_assesments;
}
