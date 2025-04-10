import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CheckoutFormService } from '../../services/checkout-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { BlueValidators } from '../../validators/blue-validators';
import { CartService } from '../../services/cart.service';

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

  constructor(private formBuilder: FormBuilder, private checkoutFormService: CheckoutFormService, private cartService: CartService){}

  ngOnInit(): void {
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')])
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
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), BlueValidators.notOnlyWhiteSpace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expMonth: [''],
        expYear: [''],
      })
    });

    //populate credit card month
    const startMonth: number = new Date().getMonth() + 1;
    this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        //console.log("Months:" + JSON.stringify(data));

        this.creditCardMonths = data;
      }
    );
    //populate credit card years
    this.checkoutFormService.getCreditCardYears().subscribe(
      data => {
        //console.log("Years:" + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    //populate countries
    this.checkoutFormService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
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
    }
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
