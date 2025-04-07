import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list-grid.component.html',
    styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;

  constructor(private productService: ProductService,
              private route: ActivatedRoute){

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

    //search with keyword
    this.productService.searchProducts(theKeyWord).subscribe(
      data => {
        this.products = data;
      }
    )
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
    this.productService.getProductList(this.currentCategoryId).subscribe(
      data => {this.products = data;}
    )
  }



}
