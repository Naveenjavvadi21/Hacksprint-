package com.careflow.repository;

import com.careflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByNameIgnoreCase(String name);
    Boolean existsByEmail(String email);
    long countByRole(com.careflow.entity.enums.Role role);
    java.util.List<User> findByRole(com.careflow.entity.enums.Role role);
}
