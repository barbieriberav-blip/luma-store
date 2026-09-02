import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    const savedUser = localStorage.getItem('luma_active_session');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch {
        this.currentUserSubject.next(null);
      }
    }
  }

  register(user: User): { success: boolean; message: string } {
    const users: User[] = JSON.parse(localStorage.getItem('luma_registered_users') || '[]');
    const exists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());

    if (exists) {
      return { success: false, message: 'El correo electrónico ya está registrado.' };
    }

    users.push(user);
    localStorage.setItem('luma_registered_users', JSON.stringify(users));
    this.login(user.email, user.password || '');
    return { success: true, message: 'Cuenta creada con éxito.' };
  }

  login(email: string, pass: string): boolean {
    const users: User[] = JSON.parse(localStorage.getItem('luma_registered_users') || '[]');
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    if (found) {
      const sessionUser: User = { id: found.id || Date.now().toString(), name: found.name, email: found.email };
      this.currentUserSubject.next(sessionUser);
      localStorage.setItem('luma_active_session', JSON.stringify(sessionUser));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('luma_active_session');
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }
}