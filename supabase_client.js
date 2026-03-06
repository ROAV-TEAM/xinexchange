const supabaseUrl = 'https://kkuekezteunxhgsbvxmx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdWVrZXp0ZXVueGhnc2J2eG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDQyOTAsImV4cCI6MjA4ODM4MDI5MH0.VtyJ0-jwgPN3zyeFj-qLrwJsR_PJsyQzn7qwt2xyOG4';

// Initialize Supabase Client (requires CDN import first)
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
