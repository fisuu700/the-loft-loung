import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoyaltyService } from '../../services/loyalty.service';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="animate-fade-in px-10 py-10">
      <div class="w-full space-y-12 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12">
        
        <!-- Leaderboard Header -->
        <div class="text-center space-y-4 md:col-span-2 lg:col-span-3">
        <h2 class="text-5xl font-bold text-loft-dark leading-tight" style="font-family: var(--font-playfair);">
          Ranking mte3 <br>
          <span class="italic text-gold">el chhar</span>
        </h2>
        <p class="text-sm text-loft-gray-muted font-medium max-w-[250px] mx-auto leading-relaxed">
          Discover the top patrons of The Loft Lounge this month. Elevate your experience and climb the ranks.
        </p>
      </div>

      <!-- User Standing Card -->
      <div class="card-light border-2 border-loft-gold/10 relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-gold/5 rounded-full blur-2xl"></div>
        
        <div class="flex items-center gap-5 relative z-10">
          <div class="w-16 h-16 rounded-2xl border-2 border-loft-gold flex items-center justify-center bg-white shadow-sm overflow-hidden">
             @if (authService.profile()?.avatar_url) {
              <img [src]="authService.profile()?.avatar_url" alt="avatar" class="w-full h-full object-cover">
            } @else {
              <div class="text-2xl font-bold text-gold">#{{ userRank() || '?' }}</div>
            }
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-lg text-loft-dark">Enti rak ranked <span class="text-gold">#{{ userRank() || '--' }}</span></h3>
            <p class="text-[11px] text-loft-gray-muted font-medium leading-tight">Keep enjoying your time to <br> reach the top 10.</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-black/5 flex items-center justify-center">
          <div class="text-center">
            <p class="text-4xl font-bold text-gold tracking-tighter" style="font-family: var(--font-playfair);">{{ monthlyPoints().toLocaleString() || 0 }}</p>
            <p class="text-[10px] font-bold text-loft-gray-muted uppercase tracking-widest mt-1">Points</p>
          </div>
        </div>
      </div>

      <!-- Top Members List -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-loft-dark px-2" style="font-family: var(--font-playfair);">Top 5 Members</h3>
        
        <div class="card-light !p-0 overflow-hidden">
          <div class="divide-y divide-black/5">
            @for (entry of leaderboard(); track entry.username; let i = $index) {
              <div class="flex items-center gap-4 p-4 transition-colors hover:bg-black/[0.01]">
                <div class="w-8 text-center font-bold text-xl" [class.text-gold]="i === 0" [class.text-loft-gray-muted]="i > 0">
                  {{ i + 1 }}
                </div>
                
                <div class="w-12 h-12 rounded-xl overflow-hidden border border-black/5">
                  @if (entry.avatar_url) {
                    <img [src]="entry.avatar_url" alt="avatar" class="w-full h-full object-cover">
                  } @else {
                    <div class="w-full h-full bg-loft-gray-light flex items-center justify-center text-sm font-bold text-loft-gray-muted">
                      {{ entry.username[0] | uppercase }}
                    </div>
                  }
                </div>

                <div class="flex-1">
                  <p class="font-bold text-sm text-loft-dark">{{ entry.username }}</p>
                  <p class="text-[10px] font-bold text-loft-gray-muted uppercase tracking-wider">
                    {{ i === 0 ? 'Elite Member' : i < 3 ? 'Premium Member' : 'Member' }}
                  </p>
                </div>

                <div class="text-right">
                  <p class="text-gold font-bold text-sm">{{ entry.points_count.toLocaleString() }}</p>
                </div>
              </div>
            } @empty {
              <div class="p-12 text-center text-loft-gray-muted italic text-sm">
                Mazel mafamma had ranked hedha el chhar...
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Info Footer -->
      <div class="pt-4 pb-8">
        <p class="text-[10px] text-center text-loft-gray-muted font-bold uppercase tracking-widest leading-relaxed">
          Leaderboard updates monthly. <br>
          Keep visitng to climb the ranks!
        </p>

        <!-- Bottom Spacer -->
        <div class="h-32 md:col-span-2 lg:col-span-3"></div>
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  public authService = inject(AuthService);
  private loyaltyService = inject(LoyaltyService);
  leaderboard = this.loyaltyService.leaderboard;
  userRank = this.loyaltyService.userRank;
  monthlyPoints = this.loyaltyService.monthlyPoints;

  constructor() {}

  async ngOnInit() {
    await this.loyaltyService.loadLeaderboard();
  }
}
