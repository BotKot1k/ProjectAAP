package com.example.logical.tables;



import jakarta.persistence.*;


@Entity
@Table(name = "question")
public class question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long question_id;

    private String question_name;

    private String[] question_answer;

    private int answer_true;
}
