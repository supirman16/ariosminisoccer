import { createClient } from '@supabase/supabase-js';

// Project URL (Base URL) dan Anon Public Key baru Anda
const supabaseUrl = 'https://kcdjrotvppepguqtckrc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZGpyb3R2cHBlcGd1cXRja3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MzAzNzcsImV4cCI6MjA5ODQwNjM3N30.kHLyL7Mt_v5EnQwFOnUt84A1YImGIltj5W1IRaQGkMo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);