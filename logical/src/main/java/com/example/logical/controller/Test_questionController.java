package com.example.logical.controller;

import com.example.logical.dto.Test_questionDTO;
import com.example.logical.repositories.Test_questionRepository;
import com.example.logical.services.Test_questionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class Test_questionController {
    @Autowired
    private Test_questionService test_questionService;

    @GetMapping("/course/test/{test_id}")
    public List<Object[]> findAllTestQuestions(@PathVariable Long test_id, @RequestParam Long current_id){
        return test_questionService.findAllQuestions(current_id, test_id);
    }

    @DeleteMapping("/test/{test_id}/question/{question_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTestQuestion(@PathVariable Long test_id, @PathVariable Long question_id, @RequestParam Long current_id){
        test_questionService.deleteTestQuestion(current_id, test_id, question_id);
    }

    @PostMapping("/test/question/")
    @ResponseStatus(HttpStatus.CREATED)
    public void createQuestion(@RequestParam Long current_id, @RequestBody Test_questionDTO test_questionDTO){
        test_questionService.createTestQuestion(current_id, test_questionDTO);
    }

    @PatchMapping("/test/{test_id}/question/{question_id}")
    public void changeQuestionNumber(@PathVariable Long test_id, @PathVariable Long question_id, @RequestParam Long current_id, @RequestParam Integer new_question_number){
        test_questionService.changeQuestionNumber(current_id, test_id, question_id, new_question_number);
    }

}
