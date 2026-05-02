import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          storage: window.localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          lock: async (name: string, acquireTimeout: number, acquire: () => Promise<any>) => {
            // Bypass LockManager which causes errors in some environments
            return await acquire();
          }
        }
      }
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
