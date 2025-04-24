import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los de tu proyecto Supabase
const supabaseUrl = 'https://dgiuqeclrldsxritbrio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnaXVxZWNscmxkc3hyaXRicmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTk4ODUsImV4cCI6MjA2MTA5NTg4NX0.YhNCSSPDZxhIQq2gtqnrX3BxXQVc-6cR4W3yFRjTCDA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
