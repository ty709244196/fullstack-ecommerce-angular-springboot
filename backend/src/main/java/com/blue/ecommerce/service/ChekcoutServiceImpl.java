package com.blue.ecommerce.service;

import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.blue.ecommerce.dao.CustomerRepository;
import com.blue.ecommerce.dto.Purchase;
import com.blue.ecommerce.dto.PurchaseResponse;
import com.blue.ecommerce.entity.Customer;
import com.blue.ecommerce.entity.Order;
import com.blue.ecommerce.entity.OrderItem;

import jakarta.transaction.Transactional;

@Service
public class ChekcoutServiceImpl implements CheckoutService{

    private CustomerRepository customerRepository;

    public ChekcoutServiceImpl(CustomerRepository customerRepository){
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        //retrieve the order info from dto
        Order order = purchase.getOrder();

        //generate tracking number
        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        //populate order with orderItems
        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));
        //populate order with billingAddress and shippingAddress
        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        //populate customer with order
        Customer customer = purchase.getCustomer();
        customer.add(order);

        //save to DB
        customerRepository.save(customer);
        //returna a response
        return new PurchaseResponse(orderTrackingNumber);
    }

    private String generateOrderTrackingNumber() {
        // generate a random UUID number
        return UUID.randomUUID().toString();
    }

}
