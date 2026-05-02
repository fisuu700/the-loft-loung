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
  Coffee 
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
    <div class="app-container max-w-md mx-auto bg-loft-black min-h-screen shadow-2xl relative shadow-loft-gold/5">
      
      <!-- Main Content -->
      <main class="animate-fade-in pb-20">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Navigation (Hidden on Login) -->
      @if (authService.isLoggedIn()) {
        <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-loft-gold/10 px-6 py-3 z-50 flex items-center justify-between safe-bottom">
          <a routerLink="/dashboard" routerLinkActive="nav-active" class="flex flex-col items-center gap-1 text-loft-text-muted transition-colors relative">
            <lucide-icon [name]="HomeIcon" [size]="24"></lucide-icon>
            <span class="text-[10px] font-medium uppercase tracking-widest">Home</span>
          </a>
          
          <a routerLink="/leaderboard" routerLinkActive="nav-active" class="flex flex-col items-center gap-1 text-loft-text-muted transition-colors relative">
            <lucide-icon [name]="TrophyIcon" [size]="24"></lucide-icon>
            <span class="text-[10px] font-medium uppercase tracking-widest">Elite</span>
          </a>

          <!-- Center Action Button -->
          <div class="w-12 h-12 -mt-10 bg-gradient-to-tr from-loft-gold to-loft-gold-light rounded-full shadow-lg shadow-loft-gold/20 flex items-center justify-center border-4 border-loft-black animate-float">
             <lucide-icon [name]="CoffeeIcon" [size]="24" class="text-loft-black"></lucide-icon>
          </div>

          <a routerLink="/profile" routerLinkActive="nav-active" class="flex flex-col items-center gap-1 text-loft-text-muted transition-colors relative">
            <lucide-icon [name]="UserIcon" [size]="24"></lucide-icon>
            <span class="text-[10px] font-medium uppercase tracking-widest">Profile</span>
          </a>

          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="nav-active" class="flex flex-col items-center gap-1 text-loft-text-muted transition-colors relative">
              <lucide-icon [name]="SettingsIcon" [size]="24"></lucide-icon>
              <span class="text-[10px] font-medium uppercase tracking-widest">Admin</span>
            </a>
          }
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

  constructor(public authService: AuthService) {}
}
