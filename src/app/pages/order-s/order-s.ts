import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart';
import { Order } from '../../models/product.model';

@Component({
  selector: 'app-order-s',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './order-s.html',
  styleUrl: './order-s.css'
})
export class OrderSComponent implements OnInit {
  order: Order | null = null;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.order = this.cartService.getLatestOrder();
  }
}
