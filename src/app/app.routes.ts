import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ProductDetailComponent } from './pages/product-detail/product-detail';
import { CheckoutComponent } from './pages/checkout/checkout';
import { AuthComponent } from './pages/auth/auth';
import { OrderSComponent } from './pages/order-s/order-s';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'order-confirmation', component: OrderSComponent },
  { path: '**', redirectTo: '' }
];