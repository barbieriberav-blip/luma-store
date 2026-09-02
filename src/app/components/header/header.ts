import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { ProductService } from '../../services/product';
import { User } from '../../models/product.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isUserMenuOpen: boolean = false;
  searchQuery: string = '';
  cartCount: number = 0;
  wishlistCount: number = 0;

  constructor(
    public cartService: CartService,
    public wishlistService: WishlistService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkSession();

    this.cartService.cartItems$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    });

    this.wishlistService.getWishlistCount().subscribe(count => {
      this.wishlistCount = count;
    });
  }

  checkSession(): void {
    const saved = localStorage.getItem('luma_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch {
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    localStorage.removeItem('luma_user');
    this.currentUser = null;
    this.isUserMenuOpen = false;
    this.router.navigate(['/auth']);
  }

  onSearch(): void {
    this.productService.setSearchQuery(this.searchQuery);
  }

  openCartDrawer(): void {
    this.cartService.toggleDrawer();
  }
}