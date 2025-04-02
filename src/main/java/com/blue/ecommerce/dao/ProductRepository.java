package com.blue.ecommerce.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blue.ecommerce.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{

}
