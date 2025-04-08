import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list-grid.component.html',
    styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {


  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;
  previousKeyword: string = "";
  //properties for pagination
  thePageNumber: number = 1;
  thePageSize: number= 5;
  theTotalElements: number = 0;

  constructor(private productService: ProductService, private route: ActivatedRoute, private cartService: CartService){

  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    })
    
    //this.productService.testCORS();
  }

  listProducts(){
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    //if we got a keyword, then in search mode, elase just list products.
    if(this.searchMode){
      this.handleSearchProducts();
    }else{
      this.handleListProducts();

    }
  }
  handleSearchProducts() {
    const theKeyWord: string = this.route.snapshot.paramMap.get('keyword')!;

    //if we have different search keyword, set page number to 1
    if(this.previousKeyword != theKeyWord){
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyWord;
    this.productService.searchProductsPaginate(this.thePageNumber - 1, this.thePageSize, theKeyWord).subscribe(this.processPageResult());
    
  }

  handleListProducts(){
    //check if 'id' parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if(hasCategoryId){
      //convert it to number using "+", "!" to tell compiler that the obj is not null
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }else{
      //if no id, dufault to 1
      this.currentCategoryId = 1;
    }

    //check if different category than previous, reset page number for 1
    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;

    this.productService.getProductListPaginate(this.thePageNumber - 1, this.thePageSize, this.currentCategoryId).subscribe(this.processPageResult());
    
  }

  addToCart(theProduct: Product) {
    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
    
    }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
    
  }

  processPageResult(){
    return (data: any) => {
      this.products = data._embedded.products;
        this.thePageNumber = data.page.number + 1;
        this.thePageSize = data.page.size;
        this.theTotalElements = data.page.totalElements;
    }
  }





}
