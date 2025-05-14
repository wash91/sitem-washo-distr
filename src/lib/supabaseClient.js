
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzhoufryfgdhvucqvwel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aG91ZnJ5ZmdkaHZ1Y3F2d2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTg4NzgsImV4cCI6MjA2MjU3NDg3OH0.uQzm1cW8VHUpmgZE3bzMAhTowR7LI8tP3Z3klTJAdlM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
