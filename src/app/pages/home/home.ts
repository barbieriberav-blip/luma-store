import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { WishlistService } from '../../services/wishlist';
import { CartService } from '../../services/cart';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'Todos';
  quickViewProduct: Product | null = null;
  selectedQuickSize: string = '';
  selectedQuickColor: string = '';

  constructor(
    private productService: ProductService,
    public wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(prods => {
      // Agregamos algunas promociones visuales automáticas
      this.products = prods.map(p => {
        if (p.id === 101 || p.id === 701 || p.id === 301) {
          return { ...p, originalPrice: Math.round(p.price * 1.25), discountBadge: '20% OFF' };
        }
        return p;
      });
      this.filteredProducts = this.products;
    });

    this.productService.getSearchQuery().subscribe(query => {
      this.applyFilters(query);
    });
  }

  filterCategory(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilters('');
  }

  private applyFilters(searchQuery: string): void {
    let result = this.products;
    if (this.selectedCategory !== 'Todos') {
      result = result.filter(p => p.category === this.selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    this.filteredProducts = result;
  }

  toggleFav(product: Product, event: Event): void {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(product);
  }

  openQuickView(product: Product, event: Event): void {
    event.stopPropagation();
    this.quickViewProduct = product;
    this.selectedQuickSize = product.sizes[0] || '';
    this.selectedQuickColor = product.colors[0]?.name || '';
  }

  closeQuickView(): void {
    this.quickViewProduct = null;
  }

  quickAddToCart(product: Product): void {
    this.cartService.addToCart(
      product,
      1,
      product.sizes[0] || 'Unitalla',
      product.colors[0]?.name || 'Estándar'
    );
  }

  addQuickViewToCart(): void {
    if (this.quickViewProduct) {
      this.cartService.addToCart(
        this.quickViewProduct,
        1,
        this.selectedQuickSize,
        this.selectedQuickColor
      );
      this.closeQuickView();
    }
  }
}
