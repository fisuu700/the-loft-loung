import { Injectable, signal, computed, effect, inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string;
  total_points: number;
  avatar_url: string | null;
  updated_at: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _session = signal<Session | null>(null);
  private _user = signal<User | null>(null);
  private _profile = signal<Profile | null>(null);
  private _loading = signal(true);

  readonly session = this._session.asReadonly();
  readonly user = this._user.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isLoggedIn = computed(() => !!this._session());
  readonly isAdmin = computed(() => this._profile()?.role === 'barista');

  private supabaseService = inject(SupabaseService);
  private injector = inject(Injector);

  constructor() {
    this.initAuth();
  }

  private getRouter(): Router {
    return this.injector.get(Router);
  }

  private async initAuth() {
    try {
      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      this._session.set(session);
      this._user.set(session?.user ?? null);

      if (session?.user) {
        await this.loadProfile(session.user.id);
      }

      this.supabaseService.client.auth.onAuthStateChange(async (event, session) => {
        this._session.set(session);
        this._user.set(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          await this.ensureProfile(session.user);
          await this.loadProfile(session.user.id);
        }

        if (event === 'SIGNED_OUT') {
          this._profile.set(null);
          this.getRouter().navigate(['/login']);
        }
      });
    } catch (error) {
      console.error('Auth init error:', error);
    } finally {
      this._loading.set(false);
    }
  }

  async signInWithGoogle() {
    const { error } = await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/app/#/dashboard'
      }
    });
    if (error) throw error;
  }

  async signInWithMagicLink(email: string) {
    const { error } = await this.supabaseService.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/app/#/dashboard'
      }
    });
    if (error) throw error;
    return true;
  }

  async signOut() {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) throw error;
    this._session.set(null);
    this._user.set(null);
    this._profile.set(null);
  }

  private async ensureProfile(user: User) {
    const { data: existingProfile } = await this.supabaseService.client
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      const username = user.user_metadata?.['full_name']
        || user.user_metadata?.['name']
        || user.email?.split('@')[0]
        || 'Loft Member';

      const avatar = user.user_metadata?.['avatar_url']
        || user.user_metadata?.['picture']
        || null;

      await this.supabaseService.client.from('profiles').insert({
        id: user.id,
        username,
        avatar_url: avatar,
        total_points: 0
      });
    }
  }

  async loadProfile(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      this._profile.set(data as Profile);
    }
  }

  async updateProfile(updates: Partial<Profile>) {
    const user = this._user();
    if (!user) return;

    const { error } = await this.supabaseService.client
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      await this.loadProfile(user.id);
    }
  }
}
