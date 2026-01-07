package com.example.logical.controller;

import com.example.logical.dto.UsersDTO;
import com.example.logical.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UsersController {
    @Autowired
    private UsersService usersService;

    @GetMapping("/users")
    public List<UsersDTO> getAllUsers(@RequestParam Long current_id){
        return usersService.getAllUsers(current_id);
    }

    @GetMapping("/user/{user_id}")
    public UsersDTO getUser(@PathVariable Long user_id, @RequestParam Long current_id){
        return usersService.findCurrentUser(current_id, user_id);
    }

    @PutMapping("/users")
    public void updateUser(@RequestParam Long current_id, @RequestBody UsersDTO userDTO){
        usersService.updateUser(current_id, userDTO);
    }

    @DeleteMapping("/user/{user_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long user_id, @RequestParam Long current_id){
        usersService.deleteUser(current_id, user_id);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public void createUser( @RequestBody UsersDTO userDTO){
        usersService.createUser(userDTO);
    }
}
