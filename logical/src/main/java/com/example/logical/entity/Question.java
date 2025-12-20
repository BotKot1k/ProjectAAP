package com.example.logical.entity;



import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Table(name = "question")
@Data
@NoArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "question_seq")
    @SequenceGenerator(name = "question_seq", sequenceName = "question_seq", allocationSize = 1)
    private Long question_id;

    private String question_name;

    private String[] question_answer;

    private int answer_true;

    @OneToMany(mappedBy = "question")
    private List<Test_question> test_questions;
}
