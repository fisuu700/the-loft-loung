import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoyaltyService } from '../../services/loyalty.service';
import { 
  LucideAngularModule, 
  UserCheck, 
  Flame, 
  Check,
  Bell
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="animate-fade-in px-10 py-10">
      <div class="w-full space-y-12 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-12">
        
        <!-- Welcome Section (Full width on grid) -->
        <div class="text-center space-y-3 md:col-span-2 lg:col-span-4 md:mb-14">
        <h2 class="text-5xl font-bold text-loft-dark leading-tight" style="font-family: var(--font-playfair);">
          Marhba bik <br>
          <span class="italic text-gold">{{ profile()?.username?.split(' ')?.[0] || 'Member' }}</span>
        </h2>
        <p class="text-sm text-loft-gray-muted font-medium max-w-[200px] mx-auto leading-relaxed">
          Welcome back to your sanctuary. Ready to log today's visit?
        </p>
      </div>

      <!-- Action Section -->
      <div class="space-y-4">
        @if (!todayCheckedIn()) {
          <button 
            (click)="startScanner()"
            [disabled]="isChecking()"
            class="w-full bg-loft-dark text-white rounded-2xl py-5 px-6 flex items-center justify-center gap-3 shadow-xl shadow-black/10 transition-transform active:scale-95 border border-loft-gold/30 disabled:opacity-50">
            @if (isChecking()) {
              <div class="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
            } @else {
              <lucide-icon [name]="UserCheckIcon" [size]="20" class="text-gold"></lucide-icon>
            }
            <span class="font-bold uppercase tracking-[0.2em] text-sm">Sajel Hdhoreck</span>
          </button>
          
          @if (errorMessage()) {
            <p class="text-[10px] text-red-500 text-center font-bold uppercase tracking-widest animate-shake">
              {{ errorMessage() }}
            </p>
          }
        } @else {
          <div class="w-full bg-green-50 border border-green-100 rounded-2xl py-6 px-4 text-center animate-scale-in">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-200">
              <lucide-icon [name]="CheckIcon" [size]="24" class="text-white"></lucide-icon>
            </div>
            <h3 class="text-green-800 font-bold uppercase tracking-widest text-sm">Presence Mseila!</h3>
            <p class="text-green-600/70 text-[10px] font-medium mt-1">Ya3tik esaha, nchoufouk ghodwa!</p>
          </div>
        }
      </div>

      <!-- Interior Placeholder -->
      <div class="w-full aspect-[16/10] bg-loft-gray-light rounded-2xl overflow-hidden relative group">
        <div class="absolute inset-0 flex items-center justify-center">
          <p class="text-xs text-loft-gray-muted font-bold tracking-widest uppercase opacity-40">The Loft Lounge Interior</p>
        </div>
      </div>

      <!-- Loyalty Stats Card -->
      <div class="card-light space-y-6">
        <h3 class="text-2xl font-bold text-loft-dark" style="font-family: var(--font-playfair);">Loyalty Stats</h3>
        
        <div class="flex items-end justify-between">
          <div class="space-y-1">
            <p class="text-[10px] font-bold text-loft-gray-muted uppercase tracking-widest">Total Points</p>
            <p class="text-6xl font-bold text-gold tracking-tighter">{{ profile()?.total_points || 0 }}</p>
          </div>
          
          <div class="relative">
            <div class="bg-[#F8F5EE] rounded-full px-4 py-2 flex items-center gap-2 border border-loft-gold/10">
              <lucide-icon [name]="FlameIcon" [size]="16" class="text-gold"></lucide-icon>
              <span class="text-xs font-bold text-gold uppercase tracking-widest">{{ streak() }} Days</span>
            </div>
            <span class="text-[9px] text-loft-gray-muted font-bold block mt-1 text-right w-full">Current Streak</span>
          </div>
        </div>
      </div>

      <!-- Progress Card -->
      <div class="card-light space-y-6">
        <p class="text-sm text-loft-gray-muted leading-relaxed">
          You're close to unlocking your next complimentary artisanal coffee.
        </p>

        <div class="space-y-3">
          <div class="flex justify-between items-end">
            <span class="text-xs font-bold text-loft-dark uppercase tracking-widest">Progress</span>
            <span class="text-sm font-bold text-gold">{{ pointsProgress() }}/100</span>
          </div>
          <div class="w-full h-2.5 bg-loft-gray-light rounded-full overflow-hidden">
            <div 
              class="h-full bg-gold transition-all duration-1000 ease-out rounded-full"
              [style.width.%]="pointsProgress()"></div>
          </div>
          <p class="text-[11px] text-loft-gray-muted italic text-right">
            Baqi <span class="font-bold text-loft-dark">{{ pointsToNextReward() }}</span> no9ta lel hadaf
          </p>
        </div>
      </div>

      <!-- Scanner Modal -->
      @if (isScanning()) {
        <div class="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
          <div id="reader" class="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-loft-gold/50"></div>
          
          @if (errorMessage()) {
            <div class="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-xs text-center max-w-sm">
              {{ errorMessage() }}
            </div>
          }

          <button (click)="stopScanner()" class="mt-8 text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2 px-6 py-3 border border-white/20 rounded-full">
            Annuler
          </button>
        </div>
      }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  readonly UserCheckIcon = UserCheck;
  readonly FlameIcon = Flame;
  readonly CheckIcon = Check;
  readonly BellIcon = Bell;

  private authService = inject(AuthService);
  private loyaltyService = inject(LoyaltyService);

  profile = this.authService.profile;
  todayCheckedIn = this.loyaltyService.todayCheckedIn;
  streak = this.loyaltyService.streak;
  monthlyPoints = this.loyaltyService.monthlyPoints;
  userRank = this.loyaltyService.userRank;

  isChecking = signal(false);
  justCheckedIn = signal(false);
  showConfetti = signal(false);
  isScanning = signal(false);
  errorMessage = signal<string | null>(null);

  // Cafe Location (The Loft Lounge placeholder)
  private readonly CAFE_LAT = 36.81897;
  private readonly CAFE_LNG = 10.18166;
  private readonly MAX_DISTANCE_METERS = 50;

  private html5QrCode: any;

  pointsProgress = computed(() => {
    const pts = this.profile()?.total_points || 0;
    return Math.min((pts % 100), 100);
  });

  pointsToNextReward = computed(() => {
    const pts = this.profile()?.total_points || 0;
    const remaining = 100 - (pts % 100);
    return remaining === 100 && pts > 0 ? 0 : remaining;
  });

  milestones = [
    { points: 50, icon: '🧁', label: 'Pâtisserie gratuite' },
    { points: 100, icon: '☕', label: '9ahwa gratuite!' },
    { points: 250, icon: '🥐', label: 'Petit-déj complet' },
    { points: 500, icon: '👑', label: 'VIP Loft Member' },
  ];

  constructor() {}

  async ngOnInit() {
    await Promise.all([
      this.loyaltyService.checkTodayStatus(),
      this.loyaltyService.calculateStreak(),
      this.loyaltyService.loadLeaderboard()
    ]);
  }

  async startScanner() {
    this.errorMessage.set(null);
    this.isScanning.set(true);
    
    // Check geolocation first to see if they are even close
    const pos = await this.getCurrentPosition();
    if (!pos) {
      this.errorMessage.set('Lezem t7el el GPS mte3ek bech nthabtou fik fel Loft!');
      this.isScanning.set(false);
      return;
    }

    const dist = this.getDistance(pos.coords.latitude, pos.coords.longitude, this.CAFE_LAT, this.CAFE_LNG);
    if (dist > this.MAX_DISTANCE_METERS) {
      this.errorMessage.set(`Yodhorli rak mouch fel Loft tawa (Distance: ${Math.round(dist)}m). Edkhol lel 9ahwa bech t-scanni!`);
      this.isScanning.set(false);
      return;
    }

    // Start Camera
    const { Html5Qrcode } = await import('html5-qrcode');
    setTimeout(() => {
      this.html5QrCode = new Html5Qrcode('reader');
      this.html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          if (decodedText === 'LOFT_LOUNGE_PROMO_2024') {
            this.stopScanner();
            this.doCheckIn();
          } else {
            this.errorMessage.set('QR Code ghalet! Thabet mel code mta3 el Loft Lounge.');
          }
        },
        () => {}
      ).catch((err: any) => {
        this.errorMessage.set('Mochkel fil camera! Thabet mel permissions.');
        this.isScanning.set(false);
      });
    }, 100);
  }

  stopScanner() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().catch(() => {});
      this.isScanning.set(false);
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async doCheckIn() {
    this.isChecking.set(true);
    try {
      const success = await this.loyaltyService.performCheckIn();
      if (success) {
        this.justCheckedIn.set(true);
        this.triggerConfetti();
      }
    } finally {
      this.isChecking.set(false);
    }
  }

  triggerConfetti() {
    this.showConfetti.set(true);
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3, angle: 60, spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#D4AF37', '#e8c84a', '#b8942e', '#F5F0E8', '#6F4E37']
        });
        confetti({
          particleCount: 3, angle: 120, spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#D4AF37', '#e8c84a', '#b8942e', '#F5F0E8', '#6F4E37']
        });
        if (Date.now() < end) { requestAnimationFrame(frame); }
        else { this.showConfetti.set(false); }
      };
      frame();
    });
  }
}
