import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[var(--color-loft-marble)]">
      <!-- Premium Background Effects -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30"
             style="background: radial-gradient(circle, var(--color-loft-pink-soft) 0%, transparent 70%); transform: translate(30%, -30%);"></div>
        <div class="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20"
             style="background: radial-gradient(circle, var(--color-loft-sage-light) 0%, transparent 70%); transform: translate(-30%, 30%);"></div>
      </div>

      <!-- Logo & Branding -->
      <div class="relative z-10 text-center mb-8 animate-slide-up">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
             style="background: white; border: 3px solid var(--color-loft-sage-light);">
          <span class="text-5xl">☕</span>
        </div>
        <h1 class="text-4xl font-bold mb-2" style="font-family: var(--font-playfair);">
          <span class="text-gradient-sage tracking-wide uppercase">The Loft Lounge</span>
        </h1>
        <p class="text-loft-dark-gray/60 text-sm tracking-[0.2em] uppercase font-medium">Loyalty Club</p>
      </div>

      <!-- Login Card -->
      <div class="relative z-10 w-full max-w-sm animate-scale-in" style="animation-delay: 0.1s;">
        <div class="glass-light rounded-[24px] p-8">
          <h2 class="text-xl font-semibold text-center mb-6 text-loft-sage-dark" style="font-family: var(--font-playfair);">
            Mar7ba bik 👋
          </h2>

          <!-- Google Login -->
          <button
            (click)="loginWithGoogle()"
            [disabled]="isLoading()"
            class="w-full flex items-center justify-center gap-3 bg-white text-loft-dark-gray border border-loft-sage-light/30 rounded-xl px-6 py-4 font-semibold text-sm uppercase tracking-wider transition-all hover:shadow-md hover:border-loft-sage hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mb-5">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Od5ol b Google
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-4 my-5 opacity-60">
            <div class="flex-1 h-px bg-loft-sage-light"></div>
            <span class="text-loft-sage-dark text-[10px] font-bold uppercase tracking-[0.2em]">wella</span>
            <div class="flex-1 h-px bg-loft-sage-light"></div>
          </div>

          <!-- Magic Link -->
          <div class="space-y-4">
            <div class="relative">
              <input
                type="email"
                [(ngModel)]="email"
                placeholder="El email mte3ek..."
                class="w-full bg-white/60 border border-loft-sage-light/50 rounded-xl px-5 py-3.5 text-loft-dark-gray placeholder:text-loft-dark-gray/40 focus:outline-none focus:border-loft-sage focus:ring-1 focus:ring-loft-sage transition-all text-sm"
              />
            </div>
            <button
              (click)="loginWithMagicLink()"
              [disabled]="isLoading() || !email"
              class="btn-rejoindre">
              @if (isLoading()) {
                <span class="inline-flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Yab3ath...
                </span>
              } @else {
                Rejoindre le club
              }
            </button>
          </div>

          <!-- Magic Link Sent Message -->
          @if (magicLinkSent()) {
            <div class="mt-5 p-4 rounded-xl bg-loft-sage-light/20 border border-loft-sage/30 text-center animate-scale-in">
              <p class="text-loft-sage-dark text-sm font-medium">
                ✨ Check el email mte3ek! Eb3athnélek link.
              </p>
            </div>
          }

          <!-- Error -->
          @if (errorMsg()) {
            <div class="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-center animate-scale-in">
              <p class="text-red-500 text-sm font-medium">{{ errorMsg() }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Footer -->
      <p class="relative z-10 mt-8 text-loft-dark-gray/40 text-xs text-center font-medium">
        By logging in, you agree to our Terms of Service
      </p>
    </div>
  `
})
export class LoginComponent {
  email = '';
  isLoading = signal(false);
  magicLinkSent = signal(false);
  errorMsg = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // If already logged in, redirect
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async loginWithGoogle() {
    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.errorMsg.set(error.message || 'Famma mochkla, 3awed jarreb.');
      this.isLoading.set(false);
    }
  }

  async loginWithMagicLink() {
    if (!this.email) return;
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.magicLinkSent.set(false);

    try {
      await this.authService.signInWithMagicLink(this.email);
      this.magicLinkSent.set(true);
    } catch (error: any) {
      this.errorMsg.set(error.message || 'Famma mochkla, 3awed jarreb.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
