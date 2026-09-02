import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product, Order } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private isDrawerOpenSubject = new BehaviorSubject<boolean>(false);
  isDrawerOpen$ = this.isDrawerOpenSubject.asObservable();

  private validCoupons: { [code: string]: number } = {
    'LUMA10': 0.10,
    'PROFE100': 0.20
  };

  private discountPercentageSubject = new BehaviorSubject<number>(0);
  discountPercentage$ = this.discountPercentageSubject.asObservable();

  private appliedCouponCodeSubject = new BehaviorSubject<string>('');
  appliedCouponCode$ = this.appliedCouponCodeSubject.asObservable();

  private shippingCostSubject = new BehaviorSubject<number>(0);
  shippingCost$ = this.shippingCostSubject.asObservable();

  private latestOrderSubject = new BehaviorSubject<Order | null>(null);
  latestOrder$ = this.latestOrderSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('luma_cart');
    if (savedCart) {
      try {
        this.cartItemsSubject.next(JSON.parse(savedCart));
      } catch {
        this.cartItemsSubject.next([]);
      }
    }
  }

  private saveCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    localStorage.setItem('luma_cart', JSON.stringify(items));
  }

  addToCart(product: Product, quantity: number = 1, size: string, color: string): boolean {
    const items = [...this.cartItemsSubject.getValue()];
    const existingIndex = items.findIndex(
      item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existingIndex > -1) {
      const newQty = items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return false;
      }
      items[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        return false;
      }
      items.push({ product, quantity, selectedSize: size, selectedColor: color });
    }

    this.saveCart(items);
    this.openDrawer();
    return true;
  }

  updateQuantity(index: number, change: number): void {
    const items = [...this.cartItemsSubject.getValue()];
    const item = items[index];
    if (!item) return;

    const newQty = item.quantity + change;
    if (newQty > 0 && newQty <= item.product.stock) {
      item.quantity = newQty;
      this.saveCart(items);
    } else if (newQty <= 0) {
      this.removeFromCart(index);
    }
  }

  removeFromCart(index: number): void {
    const items = [...this.cartItemsSubject.getValue()];
    items.splice(index, 1);
    this.saveCart(items);
  }

  clearCart(): void {
    this.saveCart([]);
    this.resetCoupon();
    this.shippingCostSubject.next(0);
  }

  openDrawer(): void { this.isDrawerOpenSubject.next(true); }
  closeDrawer(): void { this.isDrawerOpenSubject.next(false); }
  toggleDrawer(): void { this.isDrawerOpenSubject.next(!this.isDrawerOpenSubject.getValue()); }

  applyCoupon(code: string): boolean {
    const formatted = code.trim().toUpperCase();
    if (this.validCoupons[formatted]) {
      this.discountPercentageSubject.next(this.validCoupons[formatted]);
      this.appliedCouponCodeSubject.next(formatted);
      return true;
    }
    return false;
  }

  resetCoupon(): void {
    this.discountPercentageSubject.next(0);
    this.appliedCouponCodeSubject.next('');
  }

  setShippingCost(cost: number): void {
    this.shippingCostSubject.next(cost);
  }

  getSubtotal(): number {
    return this.cartItemsSubject.getValue().reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  getTotalCount(): number {
    return this.cartItemsSubject.getValue().reduce((acc, item) => acc + item.quantity, 0);
  }

  getDiscountAmount(): number {
    return this.getSubtotal() * this.discountPercentageSubject.getValue();
  }

  getTaxAmount(): number {
    const base = this.getSubtotal() - this.getDiscountAmount();
    return Math.max(0, base * 0.16);
  }

  getTotal(): number {
    return Math.max(0, this.getSubtotal() - this.getDiscountAmount() + this.getTaxAmount() + this.shippingCostSubject.getValue());
  }

  setLatestOrder(order: Order): void {
    this.latestOrderSubject.next(order);
    localStorage.setItem('luma_latest_order', JSON.stringify(order));
  }

  getLatestOrder(): Order | null {
    if (!this.latestOrderSubject.getValue()) {
      const saved = localStorage.getItem('luma_latest_order');
      if (saved) {
        this.latestOrderSubject.next(JSON.parse(saved));
      }
    }
    return this.latestOrderSubject.getValue();
  }
}
