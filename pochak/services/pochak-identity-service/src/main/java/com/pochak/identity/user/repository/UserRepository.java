package com.pochak.identity.user.repository;

import com.pochak.identity.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByNickname(String nickname);

    boolean existsByNickname(String nickname);

    Optional<User> findByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    long countByGuardianUserId(Long guardianUserId);

    @Query("""
            SELECT u FROM User u
            WHERE (:status IS NULL OR u.status = :status)
              AND (:role IS NULL OR u.role = :role)
              AND (:search IS NULL
                   OR (:searchType = 'email' AND LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
                   OR (:searchType = 'phone' AND u.phoneNumber LIKE CONCAT('%', :search, '%'))
                   OR (:searchType = 'nickname' AND LOWER(u.nickname) LIKE LOWER(CONCAT('%', :search, '%')))
                   OR (:searchType = 'name' AND LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')))
                   OR (:searchType IS NULL
                       AND (LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
                            OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :search, '%'))
                            OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')))))
            """)
    Page<User> searchMembers(@Param("status") User.UserStatus status,
                             @Param("role") User.UserRole role,
                             @Param("search") String search,
                             @Param("searchType") String searchType,
                             Pageable pageable);
}
