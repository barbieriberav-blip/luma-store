import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$: Observable<Product[]> = this.wishlistSubject.asObservable();

  constructor() {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    const saved = localStorage.getItem('luma_wishlist');
    if (saved) {
      try {
        this.wishlistSubject.next(JSON.parse(saved));
      } catch (e) {
        this.wishlistSubject.next([]);
      }
    }
  }

  getWishlist(): Product[] {
    return this.wishlistSubject.getValue();
  }

  getWishlistCount(): Observable<number> {
    return this.wishlist$.pipe(map(items => items.length));
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSubject.getValue().some(p => p.id === productId);
  }

  toggleWishlist(product: Product): void {
    const current = this.wishlistSubject.getValue();
    const index = current.findIndex(p => p.id === product.id);
    let updated: Product[];

    if (index > -1) {
      updated = current.filter(p => p.id !== product.id);
    } else {
      updated = [...current, product];
    }

    this.wishlistSubject.next(updated);
    localStorage.setItem('luma_wishlist', JSON.stringify(updated));
  }
}