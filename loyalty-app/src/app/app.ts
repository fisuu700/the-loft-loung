import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { 
  LucideAngularModule, 
  Home, 
  Trophy, 
  User, 
  Settings, 
  Coffee,
  Bell 
} from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    LucideAngularModule
  ],
  template: `
    <div class="app-container w-full max-w-md md:max-w-4xl mx-auto bg-loft-marble min-h-screen shadow-2xl relative shadow-black/5 md:my-8 md:rounded-3xl overflow-hidden">
      
      <!-- Top Header (Sticky) -->
      @if (authService.isLoggedIn()) {
        <header class="sticky top-0 z-50 bg-loft-marble/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full border-2 border-loft-gold overflow-hidden">
               @if (authService.profile()?.avatar_url) {
                <img [src]="authService.profile()?.avatar_url" alt="avatar" class="w-full h-full object-cover">
              } @else {
                <div class="w-full h-full bg-loft-gray-light flex items-center justify-center text-sm font-bold text-loft-dark">
                  {{ authService.profile()?.username?.[0] || '?' }}
                </div>
              }
            </div>
            <h1 class="text-xl font-bold italic" style="font-family: var(--font-playfair);">The Loft</h1>
          </div>
          <button class="w-10 h-10 flex items-center justify-center text-loft-gray-muted">
            <lucide-icon [name]="BellIcon" [size]="24"></lucide-icon>
          </button>
        </header>
      }

      <!-- Main Content -->
      <main class="animate-fade-in pb-24">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Navigation (Light Premium) -->
      @if (authService.isLoggedIn()) {
        <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-black/5 px-8 py-3 z-50 flex items-center justify-between safe-bottom">
          <a routerLink="/dashboard" routerLinkActive="nav-active-gold" class="flex flex-col items-center gap-1 text-loft-gray-muted transition-all">
            <lucide-icon [name]="HomeIcon" [size]="20"></lucide-icon>
            <span class="text-[9px] font-bold uppercase tracking-widest">Dashboard</span>
          </a>
          
          <a routerLink="/leaderboard" routerLinkActive="nav-active-gold" class="flex flex-col items-center gap-1 text-loft-gray-muted transition-all">
            <lucide-icon [name]="TrophyIcon" [size]="20"></lucide-icon>
            <span class="text-[9px] font-bold uppercase tracking-widest">Leaderboard</span>
          </a>

          <a routerLink="/profile" routerLinkActive="nav-active-gold" class="flex flex-col items-center gap-1 text-loft-gray-muted transition-all">
            <lucide-icon [name]="UserIcon" [size]="20"></lucide-icon>
            <span class="text-[9px] font-bold uppercase tracking-widest">Profile</span>
          </a>
        </nav>
      }
    </div>
  `
})
export class App {
  readonly HomeIcon = Home;
  readonly TrophyIcon = Trophy;
  readonly UserIcon = User;
  readonly SettingsIcon = Settings;
  readonly CoffeeIcon = Coffee;
  readonly BellIcon = Bell;

  constructor(public authService: AuthService) {}
}
