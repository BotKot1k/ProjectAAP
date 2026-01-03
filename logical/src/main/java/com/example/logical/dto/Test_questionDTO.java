package com.example.logical.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Test_questionDTO {
    private Long id;
    private Long question_id;
    private Long test_id;
    private int question_number;
}
