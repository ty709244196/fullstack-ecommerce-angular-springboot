package com.blue.ecommerce.service;

import com.blue.ecommerce.dto.PaymentInfo;
import com.blue.ecommerce.dto.Purchase;
import com.blue.ecommerce.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

    //stripe payment
    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;

}
