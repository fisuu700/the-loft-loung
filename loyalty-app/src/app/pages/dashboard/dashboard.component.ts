import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoyaltyService } from '../../services/loyalty.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
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
  private readonly MAX_DISTANCE_METERS = 15;

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
