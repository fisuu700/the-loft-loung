import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoyaltyService } from '../../services/loyalty.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen pb-24 px-4 pt-6 relative overflow-hidden">
      <!-- Admin Header -->
      <div class="relative z-10 mb-8 animate-slide-up flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gradient-gold" style="font-family: var(--font-playfair);">
            Admin View
          </h1>
          <p class="text-loft-text-muted text-sm mt-1">Barista Dashboard ☕</p>
        </div>
        <div class="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-widest">
          Secure Access
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="relative z-10 grid grid-cols-2 gap-4 mb-8 animate-scale-in">
        <button (click)="generateOfficialQR()" class="card-premium flex flex-col items-center justify-center py-6 border-loft-gold/30">
          <span class="text-3xl mb-2">🏷️</span>
          <span class="text-xs font-bold uppercase tracking-wider">Generate QR</span>
        </button>
        <button (click)="refresh()" class="card-premium flex flex-col items-center justify-center py-6">
          <span class="text-3xl mb-2">🔄</span>
          <span class="text-xs font-bold uppercase tracking-wider">Refresh</span>
        </button>
      </div>

      @if (qrDataUrl()) {
        <div class="relative z-10 mb-8 card-premium text-center animate-scale-in">
          <h3 class="text-xs font-bold uppercase tracking-widest mb-4 text-loft-gold">Official Cafe QR Code</h3>
          <img [src]="qrDataUrl()" class="mx-auto w-64 h-64 rounded-2xl border-4 border-loft-gold/20 mb-4 shadow-2xl shadow-loft-gold/10">
          <p class="text-[10px] text-loft-text-muted px-4 mb-2">Print this and put it at the counter. Only people at the cafe can scan it successfully.</p>
          <button (click)="qrDataUrl.set(null)" class="text-xs text-red-400 font-bold uppercase py-2">Close</button>
        </div>
      }

      <!-- Recent Activity -->
      <div class="relative z-10 space-y-4">
        <div class="flex items-center justify-between px-2 mb-2">
          <h3 class="text-sm font-semibold text-loft-text-muted uppercase tracking-wider">Recent Check-ins</h3>
          <span class="text-[10px] text-loft-success animate-pulse">● Live</span>
        </div>

        @for (checkIn of recentCheckIns(); track checkIn.id; let i = $index) {
          <div class="card-premium flex items-center gap-4 animate-fade-in" [style.animation-delay]="(i * 0.05) + 's'">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-loft-border">
              @if (checkIn.profiles?.avatar_url) {
                <img [src]="checkIn.profiles.avatar_url" alt="avatar" class="w-full h-full object-cover">
              } @else {
                <div class="w-full h-full bg-loft-dark flex items-center justify-center text-xs font-bold">
                  {{ (checkIn.profiles?.username || '?')[0] | uppercase }}
                </div>
              }
            </div>

            <div class="flex-1">
              <p class="font-bold text-sm">{{ checkIn.profiles?.username || 'Unknown User' }}</p>
              <p class="text-[10px] text-loft-text-muted">{{ checkIn.created_at | date:'mediumTime' }} - {{ checkIn.created_at | date:'dd MMM' }}</p>
            </div>

            <div class="text-right">
              <span class="text-xs font-bold text-loft-success">+10 pts</span>
            </div>
          </div>
        } @empty {
          <div class="text-center py-12 card-premium border-dashed opacity-50">
            <p class="text-loft-text-muted italic">Mafamma hadda tawa...</p>
          </div>
        }
      </div>

      <!-- Manual Point Addition -->
      <div class="relative z-10 mt-10 card-premium">
        <h4 class="text-xs font-bold uppercase tracking-widest mb-4 text-loft-gold">Manual Approval</h4>
        <div class="flex gap-2">
          <input [(ngModel)]="manualUserId" placeholder="User ID..." 
                 class="flex-1 bg-loft-dark border border-loft-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-loft-gold/50">
          <button (click)="addPoints()" [disabled]="!manualUserId" 
                  class="btn-gold py-2 px-6 rounded-xl text-xs">Add</button>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  private loyaltyService = inject(LoyaltyService);
  recentCheckIns = this.loyaltyService.recentCheckIns;
  manualUserId = '';

  constructor() {}

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    await this.loyaltyService.loadRecentCheckIns();
  }

  async addPoints() {
    if (!this.manualUserId) return;
    try {
      await this.loyaltyService.addPointsManually(this.manualUserId, 10);
      this.manualUserId = '';
      await this.refresh();
    } catch (err) {
      alert('Error adding points. Check User ID.');
    }
  }

  // QR Code Generation
  qrDataUrl = signal<string | null>(null);
  
  async generateOfficialQR() {
    const QRCode = (await import('qrcode')).default;
    const data = 'LOFT_LOUNGE_PROMO_2024';
    this.qrDataUrl.set(await QRCode.toDataURL(data, {
      width: 400,
      margin: 2,
      color: {
        dark: '#D4AF37',
        light: '#0a0a0a'
      }
    }));
  }
}
