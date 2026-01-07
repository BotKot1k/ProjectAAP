package com.example.logical.repositories;

import com.example.logical.entity.Test;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO test (test_name) VALUES (:test_name)", nativeQuery = true)
    void createTest(@Param("test_name") String test_name);

    @Query(value = "SELECT * FROM test WHERE test_id = :test_id", nativeQuery = true)
    Test findTestByIdNoOptional(@Param("test_id") Long test_id);

    boolean existsById(Long testId);
}
