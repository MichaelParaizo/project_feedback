package com.meuapp.feedback.repository;

import com.meuapp.feedback.domain.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // aqui podemos adicionar queries customizadas depois, ex:
    // List<Feedback> findByEmail(String email);
}