import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private baseUrl = 'http://localhost:8080/api/products'
  private categoryURL = 'http://localhost:8080/api/product-category'

  constructor(private httpClient: HttpClient) { }

  //this will not trigger CORS block because the browser is allowing simple GET request without customer header.
  getProductList(theCategoryId: number): Observable<Product[]> {
    //build URL based on category id
    const searchURL = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.httpClient.get<GetResponseProducts>(searchURL).pipe(
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

getProductCategories(): Observable<ProductCategory[]> {
  return this.httpClient.get<GetResponseProductsCategory>(this.categoryURL).pipe(
    map(response => response._embedded.productCategory)
  )  
}
}

interface GetResponseProducts{
  _embedded: {
    products: Product[];
  }
}

  interface GetResponseProductsCategory{
    _embedded: {
      productCategory: ProductCategory[];
    }
}

