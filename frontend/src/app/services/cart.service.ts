import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();
  

  constructor() { }

  addToCart(theCartItem: CartItem){
    //if already have the item in cart, 
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined!;

    if(this.cartItems.length > 0){
      //find the item in the cart by id using Array.find()
      existingCartItem = this.cartItems.find(tmpCartItem => tmpCartItem.id === theCartItem.id)!;

      //check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);
    }

    if(alreadyExistsInCart){
      existingCartItem.quantity++;
    }else{
      this.cartItems.push(theCartItem);
    }

    //total price and total quantity
    this.computeCartTotal();

  }

  computeCartTotal(){
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.unitPrice * currentCartItem.quantity;
      totalQuantityValue += currentCartItem.quantity;
    }

    //publish the new values
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log for debugging
    this.logCartData(totalPriceValue, totalQuantityValue);

  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');
    for(let tmpCartItem of this.cartItems){
      const subTotalPrice = tmpCartItem.quantity * tmpCartItem.unitPrice;
      console.log(`name=${tmpCartItem.name}, quantity=${tmpCartItem.quantity}, unitPrice=${tmpCartItem.unitPrice}, subtotal=${subTotalPrice}`);
      console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
      console.log('----------');
    }
  }

  
}
