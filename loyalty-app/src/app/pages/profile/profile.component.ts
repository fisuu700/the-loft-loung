import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pb-24 px-4 pt-6 relative overflow-hidden">
      <!-- Background Ambient -->
      <div class="absolute bottom-0 left-0 w-full h-1/2 opacity-5 pointer-events-none"
           style="background: linear-gradient(to top, #6F4E37, transparent)"></div>

      <div class="relative z-10 mb-8 animate-slide-up">
        <h1 class="text-3xl font-bold text-gradient-gold" style="font-family: var(--font-playfair);">
          Profile
        </h1>
        <p class="text-loft-text-muted text-sm mt-1">El compte mte3ek 👤</p>
      </div>

      <!-- User Info Card -->
      <div class="relative z-10 mb-8 animate-scale-in">
        <div class="card-premium flex flex-col items-center text-center py-10">
          <div class="relative mb-6">
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-loft-gold/30">
              @if (profile()?.avatar_url) {
                <img [src]="profile()!.avatar_url!" alt="avatar" class="w-full h-full object-cover">
              } @else {
                <div class="w-full h-full bg-loft-dark flex items-center justify-center text-3xl font-bold">
                  {{ (profile()?.username || '?')[0] | uppercase }}
                </div>
              }
            </div>
            <div class="absolute -bottom-2 -right-2 bg-loft-gold text-loft-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-loft-card">
              <span class="text-xs">⭐</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold">{{ profile()?.username }}</h2>
            <button (click)="editName()" class="p-1.5 rounded-lg bg-loft-gold/10 text-loft-gold hover:bg-loft-gold/20 transition-colors">
              <span class="text-xs">✏️</span>
            </button>
          </div>
          <p class="text-loft-text-muted text-sm mt-1">{{ authUser()?.email }}</p>
          
          <div class="mt-6 flex gap-2">
            <span class="px-4 py-1 rounded-full bg-loft-gold/10 text-loft-gold text-xs font-bold border border-loft-gold/20 uppercase tracking-widest">
              {{ profile()?.role || 'Member' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Settings List -->
      <div class="relative z-10 space-y-4 animate-slide-up" style="animation-delay: 0.1s;">
        <div class="card-premium flex items-center justify-between py-4">
          <div class="flex items-center gap-4">
            <span class="text-xl">📊</span>
            <div>
              <p class="font-semibold">Total Points</p>
              <p class="text-xs text-loft-text-muted">Koll el n9at elli lammethom</p>
            </div>
          </div>
          <span class="text-xl font-bold text-loft-gold">{{ profile()?.total_points }}</span>
        </div>

        <div class="card-premium flex items-center justify-between py-4">
          <div class="flex items-center gap-4">
            <span class="text-xl">🔔</span>
            <div>
              <p class="font-semibold">Notifications</p>
              <p class="text-xs text-loft-text-muted">Tawsallek ki famma jdid</p>
            </div>
          </div>
          <div class="w-10 h-5 bg-loft-gold/20 rounded-full relative">
            <div class="w-4 h-4 bg-loft-gold rounded-full absolute top-0.5 right-0.5"></div>
          </div>
        </div>

        <button (click)="logout()" class="w-full card-premium flex items-center gap-4 py-4 text-red-400 border-red-500/20 hover:bg-red-500/5 transition-colors">
          <span class="text-xl">🚪</span>
          <span class="font-semibold">O5roj (Logout)</span>
        </button>
      </div>

      <!-- App Version -->
      <p class="text-center text-[10px] text-loft-text-muted mt-12 opacity-50">
        THE LOFT LOUNGE LOYALTY v1.0.0 <br>
        Developed for premium experience
      </p>
    </div>
  `
})
export class ProfileComponent {
  private authService = inject(AuthService);
  profile = this.authService.profile;
  authUser = this.authService.user;

  constructor() {}

  async editName() {
    const currentName = this.profile()?.username || '';
    const newName = prompt("Badel esmek:", currentName);
    
    if (newName && newName !== currentName) {
      try {
        await this.authService.updateUsername(newName);
        alert("Esmek t-badel mrigel!");
      } catch (e) {
        // Error handled in service
      }
    }
  }

  async logout() {
    await this.authService.signOut();
  }
}
