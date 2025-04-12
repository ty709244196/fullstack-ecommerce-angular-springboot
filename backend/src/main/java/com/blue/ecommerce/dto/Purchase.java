package com.blue.ecommerce.dto;

import java.util.Set;

import com.blue.ecommerce.entity.Address;
import com.blue.ecommerce.entity.Customer;
import com.blue.ecommerce.entity.Order;
import com.blue.ecommerce.entity.OrderItem;

import lombok.Data;

@Data
public class Purchase {

    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;

}
