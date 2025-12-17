package com.example.logical.repositories;

import com.example.logical.entity.Users;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {

    @Query(value = "SELECT * FROM users WHERE user_id = ?1", nativeQuery = true)
    Optional<Users> findByUserId(Long user_id);

    @Query(value = "SELECT * FROM users", nativeQuery = true)
    List<Users> findAllUsers();

    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET user_firstname = :value WHERE user_id = :id", nativeQuery = true)
    void updateFirstname(@Param("id") Long id, @Param("value") String value);


    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET user_lastname = :value WHERE user_id = :id", nativeQuery = true)
    void updateLastname(@Param("id") Long id, @Param("value") String value);

    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET user_rank = :value WHERE user_id = :id", nativeQuery = true)
    void updateRank(@Param("id") Long id, @Param("value") String value);

    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET user_patronymic = :value WHERE user_id = :id", nativeQuery = true)
    void updatePatronymic(@Param("id") Long id, @Param("value") String value);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO users (user_id, user_firstname, user_lastname, user_patronymic) VALUES (:user_id, :user_firstname, :user_lastname, :user_patronymic", nativeQuery = true)
    void insertUser(@Param("user_id") Long id, @Param("user_firstname") String firstname, @Param("user_lastname") String lastname, @Param("user_patronymic") String patronymic);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM users WHERE user_id = :id", nativeQuery = true)
    void deleteUser(@Param("id") Long id);

}
