package com.example.logical.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class QuestionDTO {
    private Long question_id;
    private String question_name;
    private String[] question_answer;
    private int answer_true;
}
