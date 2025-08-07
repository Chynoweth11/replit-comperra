// --- Connect to Supabase ---
import { createClient } from '@supabase/supabase-js';

// Get Supabase config (these are your actual credentials)
const supabaseUrl = 'https://hoyioekenopqcshktsmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveWlvZWtlbm9wcWNzaGt0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTI5OTQsImV4cCI6MjA3MDA4ODk5NH0.Z6K5DZAIPwWW-Dc62Q18Xp4xB_NLtd2r4Mgg69N9HbA';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- HTML Element Selection ---
const nameInput = document.getElementById('profile-name-input');
const phoneInput = document.getElementById('profile-phone-input');
const businessInput = document.getElementById('profile-business-input');
const updateButton = document.getElementById('update-profile-button');
const logoutButton = document.getElementById('logout-button');
const goToAppButton = document.getElementById('go-to-app-button');
const messagesDiv = document.getElementById('messages');

// --- Event Listeners ---
updateButton.addEventListener('click', () => handleUpdateProfile());
logoutButton.addEventListener('click', () => handleLogout());
goToAppButton.addEventListener('click', () => goToMainApp());

// --- Functions ---

// Function to load the user's profile data into the form
async function loadProfile() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            // If no user is logged in, redirect to the login page
            window.location.href = '/';
            return;
        }

        const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(); // We only expect one profile

        if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
        }

        // Populate the form fields with the data we retrieved
        if (data) {
            nameInput.value = data.name || '';
            phoneInput.value = data.phone || '';
            businessInput.value = data.business_name || '';
        }

    } catch (error) {
        messagesDiv.textContent = 'Error loading profile: ' + error.message;
    }
}

// Function to update the user's profile
async function handleUpdateProfile() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            window.location.href = '/';
            return;
        }

        const updates = {
            id: user.id,
            name: nameInput.value,
            phone: phoneInput.value,
            business_name: businessInput.value,
            updated_at: new Date()
        };

        const { error: updateError } = await supabase.from('profiles').upsert(updates);
        if (updateError) throw updateError;
        
        messagesDiv.textContent = 'Profile updated successfully!';
        messagesDiv.style.color = 'green';
    } catch (error) {
        messagesDiv.textContent = 'Error updating profile: ' + error.message;
        messagesDiv.style.color = 'red';
    }
}

// Function to log the user out
async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/'; // Redirect to home/login page
}

// Function to go to main app
function goToMainApp() {
    window.location.href = '/'; // Redirect to main React app
}

// --- Load Profile on Page Load ---
// This will run the loadProfile function as soon as the page is ready
loadProfile();