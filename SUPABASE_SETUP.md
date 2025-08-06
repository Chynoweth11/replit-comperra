# Supabase Setup Guide for Comperra

This guide will help you set up Supabase as the new authentication and database backend for Comperra, replacing Firebase.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Choose your region and database password
4. Wait for the project to be fully provisioned

## 2. Get Your API Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **Anon public key** (this is your `SUPABASE_ANON_KEY`)

## 3. Set Environment Variables in Replit

Add these secrets to your Replit project:
- `SUPABASE_URL`: Your project URL from step 2
- `SUPABASE_ANON_KEY`: Your anon public key from step 2

## 4. Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the entire contents of `supabase-schema.sql`
3. Run the query to create all tables and security policies

## 5. Configure Authentication

### Email Authentication (default - already configured)
- Email/password authentication is enabled by default
- Email confirmations are handled automatically

### Optional: Social Authentication
To enable Google, GitHub, etc.:
1. Go to Authentication > Providers
2. Enable your desired providers
3. Add your OAuth app credentials

## 6. Test the Integration

1. Start your Replit project
2. Visit the home page
3. Click "Try New Auth System" to test sign-up and login
4. Create a test account and verify the profile system works

## 7. Database Schema Overview

The Supabase schema includes:

### Core Tables:
- **profiles**: User profiles with role-based access (customer/vendor/professional)
- **leads**: Lead capture and management
- **vendor_leads**: Lead matching between vendors and customers
- **materials**: Product catalog for comparisons
- **reviews**: User reviews and ratings

### Security Features:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Vendors can see leads in their service area
- Public read access for materials and reviews

### Performance Features:
- Optimized indexes on frequently queried columns
- Automatic timestamp updates
- Efficient lead matching queries

## 8. Migration from Firebase

The new Supabase system runs alongside the existing Firebase system during transition:

### New Routes:
- `/supabase-auth` - New authentication page
- `/supabase-profile` - New profile management

### Legacy Routes (still active):
- `/auth` - Original Firebase auth
- `/profile` - Original Firebase profile

### Data Migration:
To migrate existing Firebase data to Supabase:
1. Export data from Firebase console
2. Transform to match Supabase schema
3. Import using Supabase dashboard or SQL scripts

## 9. Production Considerations

### Security:
- Enable email confirmation in production
- Set up proper CORS origins
- Use SSL/TLS in production
- Configure rate limiting

### Performance:
- Enable connection pooling
- Set up read replicas if needed
- Monitor query performance

### Backup:
- Automatic daily backups are enabled
- Point-in-time recovery available
- Export capabilities for data portability

## 10. Development Workflow

### Local Development:
```bash
# Start the development server
npm run dev

# The app will use Supabase for:
# - User authentication
# - Profile management
# - Lead storage and matching
```

### Testing Authentication:
1. Visit `/supabase-auth`
2. Create a test account
3. Verify email confirmation (check console logs)
4. Test profile creation and updates at `/supabase-profile`

## Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
   - Check that the Supabase project is fully provisioned

2. **Authentication Not Working**
   - Ensure email confirmation is properly configured
   - Check browser console for error messages

3. **Database Errors**
   - Verify the schema was created successfully
   - Check Row Level Security policies are correct

4. **Profile Creation Failed**
   - Ensure the trigger function was created
   - Check that the profiles table has proper permissions

### Getting Help:
- Check Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Review Supabase dashboard logs
- Check browser console for client-side errors