package com.example.logical.services;

import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;

    public void deleteTestById(Long current_id, Long test_id) {
        if(!testRepository.existsById(current_id)) {
            throw new NotFoundException("Test", test_id);
        }
        testRepository.deleteById(current_id);
    }
}
