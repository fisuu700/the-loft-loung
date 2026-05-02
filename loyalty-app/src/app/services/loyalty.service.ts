import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface CheckIn {
  id: number;
  user_id: string;
  created_at: string;
}

export interface LeaderboardEntry {
  username: string;
  points_count: number;
  avatar_url?: string;
  user_id?: string;
}

const MAX_MONTHLY_POINTS = 150;
const MAX_USERS_LIMIT = 5;

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private _todayCheckedIn = signal(false);
  private _streak = signal(0);
  private _leaderboard = signal<LeaderboardEntry[]>([]);
  private _userRank = signal<number | null>(null);
  private _monthlyPoints = signal(0);
  private _systemClosed = signal(false);
  private _usersAtLimitCount = signal(0);
  private _loading = signal(false);
  private _recentCheckIns = signal<any[]>([]);

  readonly todayCheckedIn = this._todayCheckedIn.asReadonly();
  readonly streak = this._streak.asReadonly();
  readonly leaderboard = this._leaderboard.asReadonly();
  readonly userRank = this._userRank.asReadonly();
  readonly monthlyPoints = this._monthlyPoints.asReadonly();
  readonly systemClosed = this._systemClosed.asReadonly();
  readonly usersAtLimitCount = this._usersAtLimitCount.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly recentCheckIns = this._recentCheckIns.asReadonly();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  async checkTodayStatus() {
    const user = this.authService.user();
    if (!user) return;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const { data } = await this.supabaseService.client
      .from('check_ins')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay)
      .lt('created_at', endOfDay);

    this._todayCheckedIn.set(!!(data && data.length > 0));
  }

  async performCheckIn(): Promise<boolean> {
    const user = this.authService.user();
    if (!user) return false;

    this._loading.set(true);

    try {
      // 0. Sync system status and check rules
      await this.syncSystemStatus();

      if (this._systemClosed()) {
        alert("Désolé! El Loft Lounge skira l chhar htha (5 users hit 150 pts). Nchoufouk chhar jey!");
        return false;
      }

      if (this._monthlyPoints() >= MAX_MONTHLY_POINTS) {
        alert("Ya3tik el sa7a! Kammalt el 150 point mte3ek l chhar htha. Nchoufouk chhar jey!");
        return false;
      }

      // 1. Double-check today's status
      await this.checkTodayStatus();
      if (this._todayCheckedIn()) {
        return false;
      }

      // 2. Create check-in
      const { error: checkInError } = await this.supabaseService.client
        .from('check_ins')
        .insert({ user_id: user.id });

      if (checkInError) throw checkInError;

      // 3. Refresh everything
      this._todayCheckedIn.set(true);
      await this.syncSystemStatus(); // Refresh points after check-in
      await this.authService.loadProfile(user.id);
      await this.calculateStreak();
      await this.loadLeaderboard();

      return true;
    } catch (error: any) {
      console.error('Check-in error:', error);
      alert("Erreur: " + error.message);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async syncSystemStatus() {
    const user = this.authService.user();
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await this.supabaseService.client
      .from('check_ins')
      .select('user_id')
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error syncing system status:', error);
      return;
    }

    if (data) {
      // Group by user_id
      const grouped = data.reduce((acc: Record<string, number>, item: any) => {
        acc[item.user_id] = (acc[item.user_id] || 0) + 1;
        return acc;
      }, {});

      // Count how many users reached 150 points (15 check-ins)
      const usersAtLimit = Object.values(grouped).filter(count => count * 10 >= MAX_MONTHLY_POINTS).length;
      
      this._usersAtLimitCount.set(usersAtLimit);
      this._systemClosed.set(usersAtLimit >= MAX_USERS_LIMIT);

      // Update current user points
      if (user) {
        this._monthlyPoints.set((grouped[user.id] || 0) * 10);
      }
    }
  }

  async calculateStreak() {
    const user = this.authService.user();
    if (!user) return;

    const { data } = await this.supabaseService.client
      .from('check_ins')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!data || data.length === 0) {
      this._streak.set(0);
      return;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique dates
    const uniqueDates = [...new Set(data.map(d => {
      const date = new Date(d.created_at);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }))];

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedKey = `${expectedDate.getFullYear()}-${expectedDate.getMonth()}-${expectedDate.getDate()}`;

      if (uniqueDates.includes(expectedKey)) {
        streak++;
      } else {
        break;
      }
    }

    this._streak.set(streak);
  }

  async loadLeaderboard() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await this.supabaseService.client
        .from('check_ins')
        .select('user_id, profiles(username, avatar_url)')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      if (data) {
        const grouped = data.reduce((acc: Record<string, any>, item: any) => {
          const uid = item.user_id;
          if (!acc[uid]) {
            acc[uid] = {
              username: item.profiles?.username || 'Loft Member',
              avatar_url: item.profiles?.avatar_url,
              user_id: uid,
              points_count: 0
            };
          }
          acc[uid].points_count += 10;
          return acc;
        }, {});

        const sorted = Object.values(grouped)
          .sort((a: any, b: any) => b.points_count - a.points_count)
          .slice(0, 5);

        this._leaderboard.set(sorted as LeaderboardEntry[]);
        
        // Calculate user rank from this monthly list
        const user = this.authService.user();
        if (user) {
          const allSorted = Object.entries(grouped)
            .sort(([, a]: any, [, b]: any) => b.points_count - a.points_count);
          
          const rank = allSorted.findIndex(([uid]) => uid === user.id);
          this._userRank.set(rank >= 0 ? rank + 1 : null);
          this._monthlyPoints.set((grouped[user.id]?.points_count || 0));
        }
      }
    } catch (error) {
      console.error('Leaderboard error:', error);
    }
  }

  private async calculateUserRank() {
    // Rank is now calculated in loadLeaderboard()
    await this.loadLeaderboard();
  }

  async loadRecentCheckIns() {
    const { data } = await this.supabaseService.client
      .from('check_ins')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      this._recentCheckIns.set(data);
    }
  }

  async addPointsManually(userId: string, points: number = 10) {
    // Create a check-in for the user
    // In this system, 1 check-in = 10 points
    const { error: checkInError } = await this.supabaseService.client
      .from('check_ins')
      .insert({ user_id: userId });

    if (checkInError) throw checkInError;

    // Refresh system status to reflect new points
    await this.syncSystemStatus();
    await this.loadLeaderboard();
  }
}
