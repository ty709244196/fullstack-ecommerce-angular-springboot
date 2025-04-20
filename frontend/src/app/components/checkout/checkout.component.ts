import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CheckoutFormService } from '../../services/checkout-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { BlueValidators } from '../../validators/blue-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { environment } from '../../../environments/environment';
import { PaymentInfo } from '../../common/payment-info';


@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit{


  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingStates: State[] = [];
  billingStates: State[] =[];

  storage: Storage = sessionStorage;

  //initialize stripe api
  stripe = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";
  isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder, private checkoutFormService: CheckoutFormService, private cartService: CartService, private checkoutService: CheckoutService,
              private router: Router){}

  ngOnInit(): void {

    //setup stripe form
    this.setUpStripePaymentForm();
    
    this.reviewCartDetails();

    //read user email form storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        email: new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')])
      }),

      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        zipcode: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        country: new FormControl('', [Validators.required]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        zipcode: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        country: new FormControl('', [Validators.required]),
      }),
      creditCard: this.formBuilder.group({
        
      })
    });

    // populate credit card month
    // const startMonth: number = new Date().getMonth() + 1;
    // this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
    //   data => {
    //     console.log("Months:" + JSON.stringify(data));

    //     this.creditCardMonths = data;
    //   }
    // );
    // populate credit card years
    // this.checkoutFormService.getCreditCardYears().subscribe(
    //   data => {
    //     console.log("Years:" + JSON.stringify(data));
    //     this.creditCardYears = data;
    //   }
    // );

    //populate countries
    this.checkoutFormService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
  }
  setUpStripePaymentForm() {
    //get a handle to stripe elements
    var elements = this.stripe.elements();
    //create a card element
    this.cardElement = elements.create('card', {hidePostalCode: true});
    //add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');
    //add event binding for the 'cahnge' event on the card element
    this.cardElement.on('change', (event: any) => {
      this.displayError = document.getElementById('card-errors');

      if(event.complete){
        this.displayError.textContent = "";
      } else if (event.error){
        this.displayError.textContent = event.error.message;
      }
    });
  }

  reviewCartDetails(){
    //subscribe to cart service to get total price and quantity
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
  }

  onSubmit(){
    if(this.checkoutFormGroup.invalid){
      //touch all field to trigger any alerts.
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(tmpCartItem => new OrderItem(tmpCartItem));

    //set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    //populate purchase - order and order items
    purchase.order = order;
    purchase.orderItems = orderItems;

    //payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    //if valid form then create payment intent, confirm card payment, place order
    if(!this.checkoutFormGroup.invalid && this.displayError.textContent === ""){
      this.isDisabled = true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret, {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                email: purchase.customer.email,
                name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                address: {
                  line1: purchase.billingAddress.street,
                  city: purchase.billingAddress.city,
                  state: purchase.billingAddress.state,
                  postal_code: purchase.billingAddress.zipCode,
                  country: this.billingCountry?.value.code
                }
              }
            }
          }, {handleActions: false})
          .then((restult: any) => {
            if (restult.error){
              alert(`There was an error: ${restult.error.message}`);
              this.isDisabled = false;
            } else {
              //call REST API via CheckoutService
              this.checkoutService.pleaseOrder(purchase).subscribe({
                next: (response: any) => {
                  alert(`Your order has been received. \nOrder tracking number: ${response.orderTrackingNumber}`);

                  //reset cart
                  this.resetCart();
                  this.isDisabled = false;
                }, error: (err: any) => {
                  alert(`Error: ${err.message}`);
                  this.isDisabled = false;
                }
              });
            }
          });

        }
      );
    } else{
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
  }
  resetCart() {
    //reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    //reset the form
    this.checkoutFormGroup.reset();
    //clear local storage
    //localStorage.clear();
    //navigate back to main products page
    this.router.navigateByUrl("/products");
  }

  get firstName(){ return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName'); }
  get email(){ return this.checkoutFormGroup.get('customer.email'); }

  get shippingStreet() { return this.checkoutFormGroup.get('shippingAddress.street')}
  get shippingCity() { return this.checkoutFormGroup.get('shippingAddress.city')}
  get shippingState() { return this.checkoutFormGroup.get('shippingAddress.state')}
  get shippingCountry() { return this.checkoutFormGroup.get('shippingAddress.country')}
  get shippingZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipcode')}

  get billingStreet() { return this.checkoutFormGroup.get('billingAddress.street')}
  get billingCity() { return this.checkoutFormGroup.get('billingAddress.city')}
  get billingState() { return this.checkoutFormGroup.get('billingAddress.state')}
  get billingCountry() { return this.checkoutFormGroup.get('billingAddress.country')}
  get billingZipCode() { return this.checkoutFormGroup.get('billingAddress.zipcode')}

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType')}
  get creditCardName() { return this.checkoutFormGroup.get('creditCard.nameOnCard')}
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber')}
  get creditCardCvv() { return this.checkoutFormGroup.get('creditCard.securityCode')}
  get creditCardExpMonth() { return this.checkoutFormGroup.get('creditCard.expMonth')}
  get creditCardExpYear() { return this.checkoutFormGroup.get('creditCard.expYear')}

  copyShippingAddressToBillingAddress(event: any) {
    if(event.target.checked){
      
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      //bug fix for states not copying
      this.billingStates = this.shippingStates;
    }else{
      
      this.checkoutFormGroup.controls['billingAddress'].reset();

      //bug fix for sates not copying
      this.billingStates = [];
    }
  }

  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expYear);

    //if current year equals selected year, then start with the current month
    let startMonth: number;
    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }else{
      startMonth = 1;
    }

    this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    )
  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.checkoutFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingStates = data;
          
        }else if(formGroupName === 'billingAddress'){
          this.billingStates = data;
        }
        //select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    )
  }

}
