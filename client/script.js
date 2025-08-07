// --- Connect to Supabase ---
import { createClient } from '@supabase/supabase-js';

// Get Supabase config (these are your actual credentials)
const supabaseUrl = 'https://hoyioekenopqcshktsmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveWlvZWtlbm9wcWNzaGt0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTI5OTQsImV4cCI6MjA3MDA4ODk5NH0.Z6K5DZAIPwWW-Dc62Q18Xp4xB_NLtd2r4Mgg69N9HbA';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- HTML Element Selection ---
// Ensure you have elements with these IDs in your HTML file
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const phoneInput = document.getElementById('phone-input');
const otpInput = document.getElementById('otp-input');

const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');
const googleLoginButton = document.getElementById('google-login-button');
const sendOtpButton = document.getElementById('send-otp-button');
const verifyOtpButton = document.getElementById('verify-otp-button');

const messagesDiv = document.getElementById('messages');

// --- Event Listeners ---
// Add listeners for each button to call the correct function
signupButton.addEventListener('click', () => handleEmailSignUp());
loginButton.addEventListener('click', () => handleEmailLogin());
googleLoginButton.addEventListener('click', () => handleGoogleLogin());
sendOtpButton.addEventListener('click', () => handleSendOtp());
verifyOtpButton.addEventListener('click', () => handleVerifyOtp());

// --- EMAIL & PASSWORD ---
async function handleEmailSignUp() {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        await supabase.from('profiles').insert({ id: data.user.id, email: email, role: 'customer' });
        messagesDiv.textContent = 'Account created! Please check your email for verification.';
    } catch (error) {
        messagesDiv.textContent = error.message;
    }
}

async function handleEmailLogin() {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/profile.html'; // Redirect to profile page on success
    } catch (error) {
        messagesDiv.textContent = error.message;
    }
}

// --- GOOGLE SIGN-IN (OAUTH) ---
async function handleGoogleLogin() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
    } catch (error) {
        messagesDiv.textContent = error.message;
    }
}

// --- PHONE SIGN-IN (OTP) ---
async function handleSendOtp() {
    const phone = phoneInput.value;
    try {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        messagesDiv.textContent = `OTP sent to ${phone}!`;
    } catch (error) {
        messagesDiv.textContent = error.message;
    }
}

async function handleVerifyOtp() {
    const phone = phoneInput.value;
    const token = otpInput.value;
    try {
        const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
        if (error) throw error;
        // On successful OTP verification, the user is logged in.
        // The trigger will automatically create their profile if it doesn't exist.
        window.location.href = '/profile.html'; // Redirect to profile page
    } catch (error) {
        messagesDiv.textContent = error.message;
    }
}