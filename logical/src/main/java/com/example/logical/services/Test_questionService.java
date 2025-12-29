package com.example.logical.services;

import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.Test_questionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Test_questionService {
    @Autowired
    private Test_questionRepository test_questionRepository;

    public List<Object[]>  findAllQuestions(Long current_id, Long test_id) {
        if(!test_questionRepository.existsByTestId(test_id)){
            throw new NotFoundException("Test_question", test_id);
        }
        return test_questionRepository.findAllQuestions(test_id);
    }
}
