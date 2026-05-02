// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://pkerzeynpreezwjrnwhu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZXJ6ZXlucHJlZXp3anJud2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2Mzk0MzQsImV4cCI6MjA5MzIxNTQzNH0.pCzpj_fo1UibCbpcMfa97HV5KBTZsleaVFQkg9QIHDA';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabaseClient; // Global access

// ===== Global State =====
let currentUser = null;
let currentProfile = null;

// ===== Initialization =====
async function initApp() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  // Session check logic continues without alerts
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('loyalty-static/');

  if (session) {
    currentUser = session.user;
    await ensureProfile(); // Added back ensureProfile
    await loadProfile();
    
    // Only redirect if on login page and session exists
    if (isLoginPage) {
        window.location.href = 'dashboard.html';
        return; // Stop further execution to prevent loop
    }
  } else {
    // Only redirect if NOT on login page and NO session exists
    if (!isLoginPage) {
        window.location.href = 'index.html';
        return;
    }
  }

  // Auth State Change listener
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth Event:", event, session ? "Session exists" : "No session");
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
      await ensureProfile();
      // Only redirect if we are still on the login page
      console.log("Checking redirect from:", window.location.pathname);
      if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('loyalty-static/')) {
        console.log("Redirecting to dashboard...");
        window.location.href = 'dashboard.html';
      }
    }
    if (event === 'SIGNED_OUT') {
      window.location.href = 'index.html';
    }
  });
}

async function ensureProfile() {
    console.log("Checking profile for user:", currentUser.id);
    const { data: profile, error } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
    
    if (error && error.code !== 'PGRST116') {
        console.error("Error loading profile:", error);
        alert("Error loading profile: " + error.message);
        return;
    }

    if (!profile) {
        console.log("Creating new profile...");
        const username = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
        const { error: insertError } = await supabaseClient.from('profiles').insert({
            id: currentUser.id,
            username: username,
            avatar_url: currentUser.user_metadata?.avatar_url || null,
            total_points: 0
        });
        if (insertError) {
            console.error("Error creating profile:", insertError);
            alert("Error creating profile: " + insertError.message + "\nCheck if RLS policies are enabled!");
        } else {
            console.log("Profile created successfully!");
        }
    } else {
        console.log("Profile already exists.");
    }
}

async function loadProfile() {
    const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
    if (error) {
        console.error("Error loading profile data:", error);
    }
    currentProfile = data;
    return data;
}

// ===== Auth Functions =====
async function loginWithGoogle() {
    console.log("Login with Google triggered!");
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { 
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });
        
        if (error) throw error;
        console.log("OAuth started:", data);
    } catch (err) {
        console.error("Catch Error:", err);
        alert("Supabase Error: " + err.message);
    }
}

async function loginWithMagicLink(email) {
    console.log("Magic Link triggered for:", email);
    const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + '/dashboard.html' }
    });
    return { error };
}

async function logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("Logout Error:", error);
    window.location.href = 'index.html';
}

// Expose to window
window.loginWithGoogle = loginWithGoogle;
window.loginWithMagicLink = loginWithMagicLink;
window.logout = logout;
window.initApp = initApp;

// ===== Loyalty Functions =====
const MAX_MONTHLY_POINTS = 150;
const MAX_USERS_LIMIT = 5;

let systemClosed = false;
let userMonthlyPoints = 0;

async function syncSystemStatus() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const { data, error } = await supabaseClient
        .from('check_ins')
        .select('user_id')
        .gte('created_at', startOfMonth.toISOString());
        
    if (error) return;

    const grouped = data.reduce((acc, item) => {
        acc[item.user_id] = (acc[item.user_id] || 0) + 1;
        return acc;
    }, {});

    const usersAtLimit = Object.values(grouped).filter(count => count * 10 >= MAX_MONTHLY_POINTS).length;
    systemClosed = usersAtLimit >= MAX_USERS_LIMIT;
    userMonthlyPoints = (grouped[currentUser.id] || 0) * 10;
}

async function checkTodayStatus() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0,0,0,0)).toISOString();
    
    const { data } = await supabaseClient
        .from('check_ins')
        .select('id')
        .eq('user_id', currentUser.id)
        .gte('created_at', startOfDay);
        
    return data && data.length > 0;
}

async function performCheckIn() {
    await syncSystemStatus();

    if (systemClosed) {
        return { success: false, message: "Désolé! El Loft Lounge skira l chhar htha. Nchoufouk chhar jey!" };
    }

    if (userMonthlyPoints >= MAX_MONTHLY_POINTS) {
        return { success: false, message: "Ya3tik el sa7a! Kammalt el 150 point mte3ek. Nchoufouk chhar jey!" };
    }

    const alreadyDone = await checkTodayStatus();
    if (alreadyDone) return { success: false, message: "Tbarkallah 3lik, nchoufouk ghodwa!" };

    const { error: checkError } = await supabaseClient.from('check_ins').insert({ user_id: currentUser.id });
    if (checkError) throw checkError;

    await loadProfile();
    await syncSystemStatus();
    return { success: true };
}

async function getLeaderboard() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const { data: checkins, error } = await supabaseClient
        .from('check_ins')
        .select('user_id, profiles(username, avatar_url)')
        .gte('created_at', startOfMonth.toISOString());
        
    if (error) return [];

    const grouped = checkins.reduce((acc, item) => {
        const uid = item.user_id;
        if (!acc[uid]) {
            acc[uid] = {
                username: item.profiles?.username || 'Unknown',
                avatar_url: item.profiles?.avatar_url,
                user_id: uid,
                points_count: 0
            };
        }
        acc[uid].points_count += 10;
        return acc;
    }, {});

    return Object.values(grouped)
        .sort((a, b) => b.points_count - a.points_count)
        .slice(0, 5);
}
