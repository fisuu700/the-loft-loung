import { Component, OnInit, inject, computed } from '@angular/core';
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
          Ranking <br>
          <span class="italic text-gold">Global</span>
        </h2>
        <p class="text-sm text-loft-gray-muted font-medium max-w-[250px] mx-auto leading-relaxed">
          Discover the top patrons of The Loft Lounge of all time. Elevate your experience and climb the ranks.
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
            <p class="text-[11px] text-loft-gray-muted font-medium leading-tight">Keep enjoying your time to <br> reach the top rank.</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-black/5 flex items-center justify-center">
          <div class="text-center">
            <p class="text-[10px] font-bold text-loft-gray-muted uppercase tracking-widest mt-1">Official Ranking</p>
          </div>
        </div>
      </div>

      <!-- Top Members List -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-loft-dark px-2" style="font-family: var(--font-playfair);">Rank of Members</h3>
        
        <div class="card-light !p-0 overflow-hidden">
          <div class="divide-y divide-black/5">
            @for (entry of leaderboard(); track entry.user_id; let i = $index) {
              <div class="flex items-center gap-4 p-4 transition-colors hover:bg-black/[0.01]">
                <div class="w-8 text-center font-bold text-xl" [class.text-gold]="i === 0" [class.text-loft-gray-muted]="i > 0">
                   @if (i === 0) { 👑 } @else { {{ i + 1 }} }
                </div>
                
                <div class="w-12 h-12 rounded-xl overflow-hidden border border-black/5 bg-loft-gray-light flex items-center justify-center">
                  @if (entry.avatar_url && !entry.avatar_url.includes('placeholder')) {
                    <img [src]="entry.avatar_url" alt="avatar" class="w-full h-full object-cover" onerror="this.style.display='none'">
                  }
                  <div class="text-sm font-bold text-loft-gray-muted uppercase">
                    {{ entry.username[0] }}
                  </div>
                </div>

                <div class="flex-1">
                  <p class="font-bold text-sm text-loft-dark">{{ entry.username }}</p>
                  <p class="text-[10px] font-bold text-loft-gray-muted uppercase tracking-wider">
                    {{ i === 0 ? 'Elite Member' : i < 3 ? 'Premium Member' : 'Member' }}
                  </p>
                </div>

                <div class="text-right">
                  <p class="text-gold font-bold text-sm">{{ entry.points_count.toLocaleString() }}</p>
                  <p class="text-[8px] font-bold text-loft-gray-muted uppercase tracking-widest">Points</p>
                </div>
              </div>
            } @empty {
              <div class="p-12 text-center text-loft-gray-muted italic text-sm">
                Mazel mafamma had ranked...
              </div>
            }
          </div>
        </div>
      </div>

      <!-- 150 Points Club -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-loft-dark px-2" style="font-family: var(--font-playfair);">150 Points Club</h3>
        
        <div class="card-light border-2 border-gold/20 relative overflow-hidden">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-loft-gray-muted font-medium leading-relaxed">
                First 5 to reach max points.
              </p>
              <span class="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-2 py-1 rounded-md">
                {{ loyaltyService.usersAtLimitCount() }} / 5
              </span>
            </div>
            
            <div class="mb-5 bg-loft-gray-light rounded-full h-1.5 overflow-hidden">
              <div class="bg-gold h-full transition-all duration-500" [style.width]="(loyaltyService.usersAtLimitCount() / 5 * 100) + '%'"></div>
            </div>

            <div class="space-y-3">
              @for (entry of club150(); track entry.user_id; let i = $index) {
                <div class="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/[0.03]">
                  <div class="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm border border-gold/20">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm text-loft-dark truncate">{{ entry.username }}</p>
                  </div>
                  <div class="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                    <lucide-icon name="star" class="w-3 h-3 text-gold" [class.fill-gold]="true"></lucide-icon>
                  </div>
                </div>
              } @empty {
                <div class="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div class="w-12 h-12 rounded-full bg-loft-gray-light flex items-center justify-center">
                    <lucide-icon name="lock" class="w-5 h-5 text-loft-gray-muted"></lucide-icon>
                  </div>
                  <p class="text-loft-gray-muted italic text-xs max-w-[150px]">
                    Mazel had ma wsel 150 pts. Koun enta el louwel!
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Info Footer -->
      <div class="pt-8 pb-8 md:col-span-2 lg:col-span-3">
        <p class="text-[10px] text-center text-loft-gray-muted font-bold uppercase tracking-widest leading-relaxed">
          Leaderboard updates live. <br>
          Keep visitng to climb the ranks!
        </p>

        <!-- Bottom Spacer -->
        <div class="h-32"></div>
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  public authService = inject(AuthService);
  public loyaltyService = inject(LoyaltyService);
  leaderboard = this.loyaltyService.leaderboard;
  userRank = this.loyaltyService.userRank;
  monthlyPoints = this.loyaltyService.monthlyPoints;

  club150 = computed(() => {
    return this.leaderboard().filter(entry => entry.points_count >= 150);
  });

  constructor() {}

  async ngOnInit() {
    await this.loyaltyService.loadLeaderboard();
  }
}
