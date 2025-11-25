package com.meuapp.feedback.repository;

import com.meuapp.feedback.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

}
