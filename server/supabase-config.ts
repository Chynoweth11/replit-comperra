// Server-side Supabase configuration
// This injects the Supabase config into the HTML for client access

export const getSupabaseConfigScript = () => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
  
  return `
    <script>
      window.__SUPABASE_CONFIG__ = {
        url: '${supabaseUrl}',
        anonKey: '${supabaseAnonKey}'
      };
    </script>
  `;
};