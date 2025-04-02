import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'http://localhost:8080/api/products'

  constructor(private httpClient: HttpClient) { }

  //this will not trigger CORS block because the browser is allowing simple GET request without customer header.
  getProductList(): Observable<Product[]> {
    return this.httpClient.get<GetResponse>(this.baseUrl).pipe(
      map(response => response._embedded.products)
    )
  }


//   testCORS() {
//     const headers = new HttpHeaders().set('X-Test-Header', 'value');
//     this.httpClient.post(this.baseUrl, { name: 'Test' }, { headers })
//       .subscribe(
//         response => console.log('Response:', response),
//         error => console.error('CORS Error:', error)
//       );
  
// }
}

interface GetResponse{
  _embedded: {
    products: Product[];
  }
}

