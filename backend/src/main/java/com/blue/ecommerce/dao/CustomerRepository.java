package com.blue.ecommerce.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blue.ecommerce.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long>{

}
