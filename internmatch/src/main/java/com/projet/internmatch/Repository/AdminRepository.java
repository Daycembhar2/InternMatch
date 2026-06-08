package com.projet.internmatch.Repository;

import com.projet.internmatch.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    boolean existsByEmail(String email);

    Admin findAdminByEmail(String email);
}
