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

    return this.getProducts(searchURL)

  }

  searchProducts(theKeyWord: string): Observable<Product[]> {
    const searchURL = `${this.baseUrl}/search/findByNameContaining?name=${theKeyWord}`;

    return this.getProducts(searchURL)

  }
  searchProductsPaginate(thePage: number, thePageSize: number, theKeyWord: string): Observable<GetResponseProducts> {
    //build URL based on category id
    const searchURL = `${this.baseUrl}/search/findByNameContaining?name=${theKeyWord}` + `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchURL);

  }


  private getProducts(searchURL: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchURL).pipe(
      map(response => response._embedded.products)
    );
  }
  //get product for product details page, return one product
  getProduct(theProductId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
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
    );
  }

  //pagination
  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetResponseProducts> {
    //build URL based on category id
    const searchURL = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}` + `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchURL);

  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductsCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}

