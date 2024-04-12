import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://rblzqwntypomyvzqrbxk.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibHpxd250eXBvbXl2enFyYnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkxNDEyMTksImV4cCI6MjAyNDcxNzIxOX0.Q_D50YmpxRIwU059EJ12opWR9x-r-ixD6hvQeRwCGIw';
('');
export const supabase = createClient(supabaseUrl, supabaseKey);
