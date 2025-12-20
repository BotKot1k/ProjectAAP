package com.example.logical.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Test_questionDTO {
    private Long id;
    private QuestionDTO question;
    private com.example.logical.services.DTO.TestDTO test;
    private int question_number;
}
