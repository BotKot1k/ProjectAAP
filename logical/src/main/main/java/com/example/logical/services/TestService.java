package com.example.logical.services;

import com.example.logical.dto.TestDTO;
import com.example.logical.entity.Test;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.TestRepository;
import com.example.logical.security.Action;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;
    @Autowired
    private PermissionService permissionService;
    @Transactional
    public void deleteTestById(Long current_id, Long test_id) {
        if(!testRepository.existsById(test_id)) {
            throw new NotFoundException("Test", test_id);
        }
        permissionService.check(Action.TEST_DELETE, current_id);
        testRepository.deleteById(test_id);
    }

    @Transactional
    public void createTest(Long current_id, TestDTO testDTO) {
        Test test = new Test();
        test.setTest_name(testDTO.getTest_name());
        testRepository.save(test);
    }
}
