import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { Order } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
  couponCode = '';
  couponMessage = '';
  postalCode = '';
  isProcessing = false;

  formData = {
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  };

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
    }
  }

  applyCoupon(): void {
    if (this.cartService.applyCoupon(this.couponCode)) {
      this.couponMessage = '¡Cupón aplicado correctamente!';
    } else {
      this.couponMessage = 'Cupón no válido.';
    }
  }

  calculateShipping(): void {
    if (this.postalCode.length === 5) {
      const cost = Number(this.postalCode) > 50000 ? 150 : 99;
      this.cartService.setShippingCost(cost);
    }
  }

  processPayment(): void {
    this.isProcessing = true;
    setTimeout(() => {
      const order: Order = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        items: [],
        subtotal: this.cartService.getSubtotal(),
        discount: this.cartService.getDiscountAmount(),
        shipping: this.cartService.getTotal() > 0 ? 99 : 0,
        taxes: this.cartService.getTaxAmount(),
        total: this.cartService.getTotal(),
        shippingDetails: {
          fullName: this.formData.fullName,
          email: this.formData.email,
          address: this.formData.address,
          city: this.formData.city,
          postalCode: this.formData.postalCode
        },
        paymentMethod: this.formData.paymentMethod
      };

      this.cartService.setLatestOrder(order);
      this.cartService.clearCart();
      this.isProcessing = false;
      this.router.navigate(['/order-confirmation']);
    }, 2000);
  }
}
