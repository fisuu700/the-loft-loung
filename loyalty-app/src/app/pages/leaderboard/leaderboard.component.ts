import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoyaltyService } from '../../services/loyalty.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pb-24 px-4 pt-6 relative overflow-hidden">
      <!-- Background Ambient -->
      <div class="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 pointer-events-none"
           style="background: radial-gradient(circle, #D4AF37 0%, transparent 70%)"></div>

      <div class="relative z-10 mb-8 animate-slide-up">
        <h1 class="text-3xl font-bold text-gradient-gold" style="font-family: var(--font-playfair);">
          Elite Monthly
        </h1>
        <p class="text-loft-text-muted text-sm mt-1">Ranking mte3 el chhar 🏆</p>
      </div>

      <!-- User Ranking Info -->
      <div class="relative z-10 glass-gold rounded-3xl p-6 mb-8 animate-scale-in">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-loft-dark flex items-center justify-center border border-loft-gold/20">
            @if (userRank()) {
              <span class="text-2xl font-bold text-loft-gold">#{{ userRank() }}</span>
            } @else {
              <span class="text-2xl">🏅</span>
            }
          </div>
          <div>
            <p class="text-loft-text-muted text-xs uppercase tracking-wider">Your Standing</p>
            <h2 class="text-xl font-bold">
              @if (userRank()) {
                Inti ranked #{{ userRank() }}
              } @else {
                Mazelt mouch ranked
              }
            </h2>
            <p class="text-loft-text-muted text-xs mt-1">
              {{ monthlyPoints() }} points hedha el chhar
            </p>
          </div>
        </div>
      </div>

      <!-- Leaderboard List -->
      <div class="relative z-10 space-y-4">
        <h3 class="text-sm font-semibold text-loft-text-muted uppercase tracking-wider mb-4 px-2">Top 5 Members</h3>
        
        @for (entry of leaderboard(); track entry.username; let i = $index) {
          <div class="card-premium flex items-center gap-4 animate-slide-up" [style.animation-delay]="(i * 0.1) + 's'">
            <div class="w-8 text-center font-bold" [class.text-loft-gold]="i < 3">
              {{ i + 1 }}
            </div>
            
            <div class="w-12 h-12 rounded-full overflow-hidden border-2" 
                 [class.border-loft-gold]="i === 0"
                 [class.border-loft-border]="i !== 0">
              @if (entry.avatar_url) {
                <img [src]="entry.avatar_url" alt="avatar" class="w-full h-full object-cover">
              } @else {
                <div class="w-full h-full bg-loft-dark flex items-center justify-center text-sm font-bold">
                  {{ entry.username[0] | uppercase }}
                </div>
              }
            </div>

            <div class="flex-1">
              <p class="font-bold text-base">{{ entry.username }}</p>
              <div class="flex items-center gap-1">
                <span class="text-[10px] uppercase text-loft-text-muted tracking-tighter">Elite Member</span>
                @if (i === 0) { <span class="text-xs">👑</span> }
              </div>
            </div>

            <div class="text-right">
              <p class="text-loft-gold font-bold text-lg">{{ entry.points_count }}</p>
              <p class="text-[10px] text-loft-text-muted uppercase">Points</p>
            </div>
          </div>
        } @empty {
          <div class="text-center py-12">
            <p class="text-loft-text-muted italic">Mazel mafamma had ranked hedha el chhar...</p>
          </div>
        }
      </div>

      <!-- Info Card -->
      <div class="relative z-10 mt-10 card-premium border-dashed opacity-70">
        <p class="text-xs text-center text-loft-text-muted">
          El leaderboard yetbaddel kol awwel chhar. <br>
          Lamm el n9at bach todhhor hna!
        </p>
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  private loyaltyService = inject(LoyaltyService);
  leaderboard = this.loyaltyService.leaderboard;
  userRank = this.loyaltyService.userRank;
  monthlyPoints = this.loyaltyService.monthlyPoints;

  constructor() {}

  async ngOnInit() {
    await this.loyaltyService.loadLeaderboard();
  }
}
