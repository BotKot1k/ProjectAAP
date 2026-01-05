package com.example.logical.controller;

import com.example.logical.dto.QuestionDTO;
import com.example.logical.entity.Question;
import com.example.logical.services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/question")
public class QuestionController {
    @Autowired
    private QuestionService questionService;

    @PatchMapping("/{question_id}")
    public void changeQuestionName(@PathVariable Long question_id, @RequestBody String new_question_name, @RequestParam Long current_id){
        questionService.changeQuestionName(current_id, new_question_name, question_id);
    }

    @DeleteMapping("/{question_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuestion(@RequestParam Long current_id, @PathVariable Long question_id){
        questionService.deleteQuestion(current_id, question_id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Long createQuestion(@RequestBody QuestionDTO questionDTO, @RequestParam Long current_id){
        return questionService.newQuestion(current_id, questionDTO);
    }

}
