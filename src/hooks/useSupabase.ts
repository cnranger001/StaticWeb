import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhbjcqgmeuyyipnstrpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYmpjcWdtZXV5eWlwbnN0cnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MDg1OTAsImV4cCI6MjA2MDA4NDU5MH0.xR-pVUEbmYVi97mqgUgqabff8cTNEjI1xUblL5Loi50';

const supabase = createClient(supabaseUrl, supabaseKey);

const useSupabase = () => {
  return supabase;
};

export default useSupabase;