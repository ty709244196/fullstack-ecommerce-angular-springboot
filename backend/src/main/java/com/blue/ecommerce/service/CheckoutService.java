package com.blue.ecommerce.service;

import com.blue.ecommerce.dto.Purchase;
import com.blue.ecommerce.dto.PurchaseResponse;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

}
