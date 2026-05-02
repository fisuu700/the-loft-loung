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

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private _todayCheckedIn = signal(false);
  private _streak = signal(0);
  private _leaderboard = signal<LeaderboardEntry[]>([]);
  private _userRank = signal<number | null>(null);
  private _monthlyPoints = signal(0);
  private _loading = signal(false);
  private _recentCheckIns = signal<any[]>([]);

  readonly todayCheckedIn = this._todayCheckedIn.asReadonly();
  readonly streak = this._streak.asReadonly();
  readonly leaderboard = this._leaderboard.asReadonly();
  readonly userRank = this._userRank.asReadonly();
  readonly monthlyPoints = this._monthlyPoints.asReadonly();
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
      // Double-check today's status
      await this.checkTodayStatus();
      if (this._todayCheckedIn()) {
        alert("Rak salla7t hdhorek lyoum deja!");
        return false;
      }

      // Create check-in
      const { error: checkInError } = await this.supabaseService.client
        .from('check_ins')
        .insert({ user_id: user.id });

      if (checkInError) {
        alert("Erreur check-in: " + checkInError.message);
        throw checkInError;
      }

      // Get fresh points to avoid overwriting with stale local state
      const { data: profileData, error: fetchError } = await this.supabaseService.client
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        alert("Erreur fetch points: " + fetchError.message);
        throw fetchError;
      }

      const currentPoints = profileData?.total_points || 0;

      // Add 10 points to profile
      const { error: updateError } = await this.supabaseService.client
        .from('profiles')
        .update({ total_points: currentPoints + 10 })
        .eq('id', user.id);

      if (updateError) {
        alert("Erreur update points (RLS?): " + updateError.message);
        throw updateError;
      }

      // Refresh state
      this._todayCheckedIn.set(true);
      await this.authService.loadProfile(user.id);
      await this.calculateStreak();
      await this.loadLeaderboard(); // Refresh monthly points and rank

      return true;
    } catch (error: any) {
      console.error('Check-in error:', error);
      return false;
    } finally {
      this._loading.set(false);
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
      // Try using the RPC function first
      const { data, error } = await this.supabaseService.client
        .rpc('get_monthly_leaderboard');

      if (!error && data) {
        this._leaderboard.set(data);
      } else {
        // Fallback: manual query
        await this.loadLeaderboardFallback();
      }

      // Calculate user rank
      await this.calculateUserRank();
    } catch {
      await this.loadLeaderboardFallback();
    }
  }

  private async loadLeaderboardFallback() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await this.supabaseService.client
      .from('check_ins')
      .select('user_id, profiles(username, avatar_url)')
      .gte('created_at', startOfMonth.toISOString());

    if (data) {
      const grouped = data.reduce((acc: Record<string, any>, item: any) => {
        const uid = item.user_id;
        if (!acc[uid]) {
          acc[uid] = {
            username: item.profiles?.username || 'Unknown',
            avatar_url: item.profiles?.avatar_url,
            user_id: uid,
            points_count: 0
          };
        }
        acc[uid].points_count++;
        return acc;
      }, {});

      const sorted = Object.values(grouped)
        .sort((a: any, b: any) => b.points_count - a.points_count)
        .slice(0, 5);

      this._leaderboard.set(sorted as LeaderboardEntry[]);
    }
  }

  private async calculateUserRank() {
    const user = this.authService.user();
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await this.supabaseService.client
      .from('check_ins')
      .select('user_id')
      .gte('created_at', startOfMonth.toISOString());

    if (data) {
      const grouped = data.reduce((acc: Record<string, number>, item: any) => {
        acc[item.user_id] = (acc[item.user_id] || 0) + 1;
        return acc;
      }, {});

      const sorted = Object.entries(grouped)
        .sort(([, a], [, b]) => b - a);

      const rank = sorted.findIndex(([uid]) => uid === user.id);
      this._userRank.set(rank >= 0 ? rank + 1 : null);
      this._monthlyPoints.set(grouped[user.id] || 0);
    }
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
    const { error: checkInError } = await this.supabaseService.client
      .from('check_ins')
      .insert({ user_id: userId });

    if (checkInError) throw checkInError;

    // Get current points
    const { data: profile } = await this.supabaseService.client
      .from('profiles')
      .select('total_points')
      .eq('id', userId)
      .single();

    if (profile) {
      await this.supabaseService.client
        .from('profiles')
        .update({ total_points: (profile.total_points || 0) + points })
        .eq('id', userId);
    }
  }
}
