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
    <div class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10"
             style="background: radial-gradient(circle, #D4AF37 0%, transparent 70%)"></div>
        <div class="absolute bottom-0 left-0 right-0 h-1/3 opacity-5"
             style="background: linear-gradient(to top, #6F4E37, transparent)"></div>
      </div>

      <!-- Logo & Branding -->
      <div class="relative z-10 text-center mb-10 animate-slide-up">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center animate-pulse-gold"
             style="background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05)); border: 2px solid rgba(212,175,55,0.3);">
          <span class="text-5xl">☕</span>
        </div>
        <h1 class="text-3xl font-bold mb-2" style="font-family: var(--font-playfair);">
          <span class="text-gradient-gold">The Loft Lounge</span>
        </h1>
        <p class="text-loft-text-muted text-sm tracking-widest uppercase">Loyalty Club</p>
      </div>

      <!-- Login Card -->
      <div class="relative z-10 w-full max-w-sm animate-scale-in" style="animation-delay: 0.2s;">
        <div class="glass-gold rounded-3xl p-8">
          <h2 class="text-xl font-semibold text-center mb-6">
            Mar7ba bik 👋
          </h2>

          <!-- Google Login -->
          <button
            (click)="loginWithGoogle()"
            [disabled]="isLoading()"
            class="w-full flex items-center justify-center gap-3 bg-white text-gray-800 rounded-2xl px-6 py-4 font-semibold text-base transition-all hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mb-4">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Od5ol b Google
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-4 my-5">
            <div class="flex-1 h-px bg-loft-border"></div>
            <span class="text-loft-text-muted text-xs uppercase tracking-wider">wella</span>
            <div class="flex-1 h-px bg-loft-border"></div>
          </div>

          <!-- Magic Link -->
          <div class="space-y-3">
            <input
              type="email"
              [(ngModel)]="email"
              placeholder="El email mte3ek..."
              class="w-full bg-loft-dark border border-loft-border rounded-2xl px-5 py-4 text-loft-text placeholder:text-loft-text-muted/50 focus:outline-none focus:border-loft-gold/50 transition-colors text-base"
            />
            <button
              (click)="loginWithMagicLink()"
              [disabled]="isLoading() || !email"
              class="btn-rejoindre"
              style="text-decoration: none !important; border: none !important; outline: none !important; -webkit-appearance: none; appearance: none;">
              @if (isLoading()) {
                <span class="inline-flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-loft-black/30 border-t-loft-black rounded-full animate-spin"></span>
                  Yab3ath...
                </span>
              } @else {
                Rejoindre le club
              }
            </button>
          </div>

          <!-- Magic Link Sent Message -->
          @if (magicLinkSent()) {
            <div class="mt-4 p-4 rounded-2xl bg-loft-success/10 border border-loft-success/20 text-center animate-scale-in">
              <p class="text-loft-success text-sm font-medium">
                ✅ Check el email mte3ek! Eb3athnélek link.
              </p>
            </div>
          }

          <!-- Error -->
          @if (errorMsg()) {
            <div class="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center animate-scale-in">
              <p class="text-red-400 text-sm">{{ errorMsg() }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Footer -->
      <p class="relative z-10 mt-8 text-loft-text-muted/50 text-xs text-center">
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
