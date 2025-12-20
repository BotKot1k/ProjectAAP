package com.example.logical.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "test_question")
@Data
@NoArgsConstructor
public class Test_question {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "test_question_seq")
    @SequenceGenerator(name = "test_question_seq", sequenceName = "test_question_seq", allocationSize = 1)
    private int id;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    private int question_number;
}
