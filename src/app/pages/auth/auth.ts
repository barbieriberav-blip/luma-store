import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  isLogin = true;
  name = '';
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.isLogin) {
      if (this.authService.login(this.email, this.password)) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Credenciales inválidas o usuario no registrado.';
      }
    } else {
      const res = this.authService.register({ name: this.name, email: this.email, password: this.password });
      if (res.success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = res.message;
      }
    }
  }
}