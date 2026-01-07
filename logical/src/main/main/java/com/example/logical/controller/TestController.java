package com.example.logical.controller;

import com.example.logical.dto.TestDTO;
import com.example.logical.services.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {
    @Autowired
    private TestService testService;

    @PostMapping
    public void createTest(@RequestParam Long current_id, @RequestBody TestDTO testDTO){
        testService.createTest(current_id, testDTO);
    }
}
