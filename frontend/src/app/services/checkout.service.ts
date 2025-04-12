import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl = 'http://localhost:8080/api/checkout/purchase';

  constructor(private httpClient: HttpClient) { }

  pleaseOrder(purchase: Purchase): Observable<any>{
    console.log(JSON.stringify(purchase));
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }
}
