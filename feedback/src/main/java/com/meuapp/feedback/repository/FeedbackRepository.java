package com.meuapp.feedback.repository;

import com.meuapp.feedback.domain.Feedback;
import com.meuapp.feedback.domain.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Page<Feedback> findByRestaurant(Restaurant restaurant, Pageable pageable);

    Page<Feedback> findByRestaurantAndCupomValidadoTrue(Restaurant restaurant, Pageable pageable);

    Page<Feedback> findByRestaurantAndCupomValidadoFalse(Restaurant restaurant, Pageable pageable);

    Optional<Feedback> findByCupom(String cupom);
}
