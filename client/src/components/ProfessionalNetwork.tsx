import React, { useState, useEffect, useContext } from 'react';
import { ShieldCheck, UserPlus, FilePlus, LogIn, LogOut, Search, Gem, Bell, BarChart, XCircle, CreditCard, HelpCircle, Lock, Award, Briefcase, UserCheck, ArrowLeft, Star, Mail } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/contexts/AuthContext';
import firebaseService from '@/services/firebase-network';
import Header from '@/components/header';
import Footer from '@/components/footer';
import SubscriptionPlanSelector from './SubscriptionPlanSelector';

// Common UI Components
const Card = ({ children, className }) => <div className={`bg-white shadow-lg shadow-slate-200/40 rounded-xl p-6 md:p-8 border border-slate-200 ${className}`}>{children}</div>;
const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-400',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    };
    return <button type={type} onClick={onClick} className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 ${variants[variant]} ${className}`} disabled={disabled}>{children}</button>;
};
const Input = ({ id, name, type, value, onChange, placeholder, required = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{placeholder}</label>
        <input id={id} name={name || id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm p-3" />
    </div>
);
const Select = ({ id, name, value, onChange, children, required = true, label }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <select id={id} name={name || id} value={value} onChange={onChange} required={required} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm p-3 bg-white">{children}</select>
    </div>
);
const Textarea = ({ id, name, value, onChange, label, placeholder, required = false, description }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        {description && <p className="text-xs text-slate-500 mb-1.5">{description}</p>}
        <textarea id={id} name={name || id} value={value} onChange={onChange} placeholder={placeholder} required={required} rows="3"
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm p-3" />
    </div>
);
const SkeletonLoader = ({ className }) => <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`}></div>;

function SubscriptionInfoModal({ onClose }) {
    const tiers = firebaseService.subscriptionTiers;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-slate-900">Subscription Plans</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button></div>
                 <p className="text-center mb-6 bg-green-100 text-green-800 font-semibold p-3 rounded-lg">✅ Comperra Connect is always 100% free for customers submitting project leads.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {Object.values(tiers).map(tier => (
                        <div key={tier.name} className="border border-slate-200 rounded-lg p-6 flex flex-col">
                            <h3 className="text-xl font-bold text-blue-600">{tier.name}</h3>
                            <p className="text-3xl font-bold my-4 text-slate-900">{tier.cost}</p>
                            <div className="text-slate-600 flex-grow">
                                {tier.description.includes('🔒') ? (
                                    <div className="space-y-2 text-left">
                                        {tier.description.split('\n').map((line, index) => (
                                            <p key={index} className="text-sm">{line}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <p>{tier.description}</p>
                                )}
                            </div>
                            {!tier.description.includes('📍') && (
                                <p className="mt-4 font-semibold text-slate-800">Matching Radius: <span className="font-bold">{tier.radius} miles</span></p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Login({ setView }) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { signIn, resetPassword } = useContext(AuthContext);
    const { toast } = useToast();
    const handleChange = e => setFormData(p => ({...p, [e.target.name]: e.target.value}));
    
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true);
        try { 
            await signIn(formData.email, formData.password);
            toast({
                title: "Login successful!",
                description: "Welcome back to your professional account.",
            });
        } 
        catch (error) { 
            toast({
                title: "Login failed",
                description: "Invalid credentials. Please try again.",
                variant: "destructive",
            });
        } 
        finally { setLoading(false); }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.email.includes('@')) {
            toast({
                title: "Invalid email",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return;
        }
        
        setLoading(true);
        
        try {
            await resetPassword(formData.email);
            toast({
                title: "Reset email sent",
                description: "Password reset instructions sent to your email! Please check your inbox and follow the instructions to reset your password.",
            });
            setShowForgotPassword(false);
        } catch (error: any) {
            console.error('Password reset error:', error);
            toast({
                title: "Failed to send reset email",
                description: error.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="space-y-4">
            {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-center text-slate-900">Reset Password</h2>
                        <p className="text-center text-slate-600 mt-2">Enter your email to receive reset instructions</p>
                    </div>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
                    <div className="space-y-3">
                        <Button type="submit" disabled={loading} onClick={handleForgotPassword}>
                            <Mail size={20}/> {loading ? 'Sending...' : 'Send Reset Instructions'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setShowForgotPassword(false)} className="w-full">
                            <ArrowLeft size={16}/> Back to Login
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-center text-slate-900">Professional & Supplier Login</h2>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" />
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" />
                    <Button type="submit" disabled={loading} onClick={handleSubmit}>
                        <LogIn size={20}/> {loading ? 'Signing in...' : 'Log In'}
                    </Button>
                    <div className="text-center space-y-2">
                        <button 
                            type="button" 
                            onClick={() => setShowForgotPassword(true)} 
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </button>
                        <p className="text-sm text-slate-500">
                            Need an account? <button type="button" onClick={() => setView('register')} className="font-semibold text-blue-600 hover:underline">Register Now</button>
                        </p>
                    </div>
                </form>
            )}
        </Card>
    );
}

function Register({ setView }) {
    const { signUp } = useContext(AuthContext);
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', zipCode: '', type: 'pro', subscription: '', services: [] });
    
    const serviceOptions = { 
        pro: ['Tile Installation', 'Slabs/Countertop Supply & Installation', 'Vinyl & LVT Installation', 'Hardwood Floor Installation', 'Carpet Installation', 'Heating & Thermostat Installation'], 
        vendor: ['Tile Supplier', 'Vinyl & LVT Supplier', 'Hardwood Flooring Supplier', 'Carpet Supplier', 'Heating & Thermostat Product Seller', 'Setting Materials']
    };

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleServiceToggle = (service) => setFormData(p => ({ ...p, services: p.services.includes(service) ? p.services.filter(s => s !== service) : [...p.services, service] }));
    
    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setFormData(p => ({ ...p, subscription: plan.id }));
        setShowPlanSelector(false);
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        // Validation checks
        if(formData.services.length === 0) { 
            toast.toast({ title: 'Error', description: 'Please select at least one service.', variant: 'destructive' }); 
            return; 
        }
        if(!formData.subscription) { 
            toast.toast({ title: 'Error', description: 'Please select a subscription plan.', variant: 'destructive' }); 
            return; 
        }
        if(formData.password.length < 6) { 
            toast.toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' }); 
            return; 
        }
        if(formData.password !== formData.confirmPassword) { 
            toast.toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' }); 
            return; 
        }
        
        setLoading(true); 
        toast.toast({ title: 'Creating account...', description: 'Please wait while we set up your account.' });
        try { 
            // Map form data to signUp format
            const signUpData = {
                email: formData.email,
                password: formData.password,
                role: (formData.type === 'pro' ? 'trade' : 'vendor') as 'trade' | 'vendor',
                name: formData.name,
                companyName: formData.name // For professionals, use name as company name
            };
            
            await signUp(signUpData); 
            toast.toast({ title: 'Success!', description: 'Registration successful! Please log in.' });
            setView('login'); 
        } 
        catch(error) { 
            console.error('Registration error:', error);
            toast.toast({ 
                title: 'Error', 
                description: error.code === 'auth/email-already-in-use' ? 'Email already exists.' : 'Registration failed.',
                variant: 'destructive'
            }); 
        } 
        finally { setLoading(false); }
    };
    return (
        <>
        {showInfoModal && <SubscriptionInfoModal onClose={() => setShowInfoModal(false)} />}
        <Card><form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-slate-900">Join Comperra Connect</h2>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" />
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password (min. 6 chars)" />
            <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />
            <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="5-Digit ZIP Code" />
            <Select id="type" label="Account Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, services: [] })}>
                <option value="pro">Trade Professional (Installation)</option><option value="vendor">Supplier (Material Sales)</option>
            </Select>
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-700">Subscription Plan</label>
                    <button type="button" onClick={() => setShowInfoModal(true)} className="text-blue-600 hover:text-blue-800">
                        <HelpCircle size={18}/>
                    </button>
                </div>
                {selectedPlan ? (
                    <div className="p-3 border border-slate-300 rounded-lg bg-gray-50 flex items-center justify-between">
                        <div>
                            <span className="font-medium text-slate-900">{selectedPlan.name}</span>
                            <span className="text-slate-600 ml-2">{selectedPlan.price}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPlanSelector(true)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowPlanSelector(true)}
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-left"
                    >
                        Select subscription plan...
                    </button>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Services You Provide</label>
                <div className="grid grid-cols-2 gap-2">{serviceOptions[formData.type].map(service => (<button type="button" key={service} onClick={() => handleServiceToggle(service)} className={`p-3 rounded-lg text-sm text-center transition-colors ${formData.services.includes(service) ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{service}</button>))}</div>
            </div>
            <Button type="submit" disabled={loading}><UserPlus size={20}/> {loading ? 'Registering...' : 'Register'}</Button>
            <p className="text-center text-sm text-slate-500">Already have an account? <button type="button" onClick={() => setView('login')} className="font-semibold text-blue-600 hover:underline">Log In</button></p>
        </form></Card>
        
        {/* Subscription Plan Selector */}
        {showPlanSelector && (
            <SubscriptionPlanSelector
                onSelectPlan={handlePlanSelect}
                onClose={() => setShowPlanSelector(false)}
            />
        )}
        </>
    );
}

function Dashboard() {
    const { user, signOut } = useContext(AuthContext);
    const [leads, setLeads] = useState([]);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const toast = useToast();
    useEffect(() => {
        const fetchLeads = async () => { setLoadingLeads(true); const matchedLeads = await firebaseService.getMatchedLeads(user); setLeads(matchedLeads); setLoadingLeads(false); };
        if(user) fetchLeads();
    }, [user]);
    const handleClaimLead = async (leadId) => {
        if (!user) return;
        const canClaim = (user.subscription === 'credit' && user.credits > 0) || (user.subscription === 'basic' && user.claimedLeads.length < 4) || user.subscription === 'pro';
        if (!canClaim) { toast.toast({ title: 'Error', description: 'Please upgrade your plan or buy credits.', variant: 'destructive' }); return; }
        toast.toast({ title: 'Claiming lead...', description: 'Processing your request.' });
        await firebaseService.claimLead(user.uid, leadId);
        const updatedProfile = await firebaseService.getMemberProfile(user.uid);
        setUser(updatedProfile);
        toast.toast({ title: 'Success!', description: 'Lead claimed!' });
    };
    const handleStripeCheckout = async () => {
        toast.toast({ title: 'Redirecting to payment...', description: 'Processing your purchase.' });
        await firebaseService.createStripeCheckout(user.uid);
        setTimeout(() => { toast.toast({ title: 'Success!', description: 'Payment successful! Credits added.' }); setUser(p => ({ ...p, credits: (p.credits || 0) + 5 })); }, 2000);
    };
    if (!user) return null;
    const claimedLeadCount = user.claimedLeads?.length || 0;
    return (
        <div className="lg:col-span-2">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div><h2 className="text-3xl font-bold text-slate-900">Welcome, {user.displayName}!</h2>
                    <p className="text-slate-600">Subscription: <span className="font-semibold text-blue-600">{firebaseService.subscriptionTiers[user.subscription]?.name}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    {user.subscription === 'credit' && <div className="flex items-center gap-2 bg-amber-100 text-amber-800 font-bold py-2 px-4 rounded-lg"><Gem className="text-amber-500" size={20}/> {user.credits} Credits</div>}
                    {user.subscription === 'basic' && <div className="flex items-center gap-2 bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg">{claimedLeadCount} / 2 leads claimed this month</div>}
                    <Button onClick={signOut} variant="secondary" className="!w-auto"><LogOut size={16}/> Logout</Button>
                </div>
            </div>
             <Card className="w-full">
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-900">Your Matched Leads</h3>
                     {user.subscription === 'credit' && <Button onClick={handleStripeCheckout} variant="success" className="!w-auto text-sm !py-2"><CreditCard size={16} /> Buy 5 More Credits</Button>}
                </div>
                <div className="space-y-4">
                    {loadingLeads ? ( <> <SkeletonLoader className="h-24" /> <SkeletonLoader className="h-24" /> </> ) : 
                    leads.length > 0 ? (
                        leads.map(lead => {
                            const canClaim = (user.subscription === 'credit' && user.credits > 0) || (user.subscription === 'basic' && claimedLeadCount < 4) || user.subscription === 'pro';
                            const purchaseButtonText = user.subscription === 'credit' ? 'Purchase (1 Credit)' : 'Claim Lead';
                            return (
                                <div key={lead.id} className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div><h4 className="font-bold text-lg text-blue-700">{lead.serviceType}</h4><p className="text-sm text-slate-600">Project ZIP: {lead.zipCode}</p></div>
                                        <p className="font-semibold text-slate-700 text-right">{Math.round(lead.distance)} miles away</p>
                                    </div>
                                    {user.subscription !== 'pro' && <Button onClick={() => handleClaimLead(lead.id)} disabled={!canClaim} variant="primary" className="!w-auto !py-2 !px-3 text-sm mt-4"><Gem size={16}/> {purchaseButtonText}</Button>}
                                </div>
                            );
                        })
                    ) : ( <div className="text-center py-10 px-4 bg-slate-100 rounded-lg"><Search className="mx-auto text-slate-400 h-12 w-12" /><h3 className="mt-2 text-lg font-medium text-slate-800">New leads will appear here when they match your profile.</h3></div> )}
                </div>
            </Card>
        </div>
    );
}

export function SubmitLeadForm({ onBack }) {
    const { user } = useContext(AuthContext);
    const initialFormState = { 
        name: '', 
        email: '', 
        phone: '', 
        customerType: '',
        address: '',
        city: '',
        state: 'AZ',
        zipCode: '', 
        materialCategories: [],
        projectType: '',
        budget: '',
        timeline: '',
        projectDetails: '',
        professionalType: 'vendor'
    };
    const [formData, setFormData] = useState(initialFormState);
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const handleChange = e => {
        let value = e.target.value;
        
        // Format phone number
        if (e.target.name === 'phone') {
            // Remove all non-digits
            const digits = value.replace(/\D/g, '');
            
            // Format as (xxx)-xxx-xxxx
            if (digits.length <= 3) {
                value = digits;
            } else if (digits.length <= 6) {
                value = `(${digits.slice(0, 3)})-${digits.slice(3)}`;
            } else {
                value = `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
            }
        }
        
        setFormData(p => ({...p, [e.target.name]: value}));
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); 
        toast.toast({ title: 'Finding your match...', description: 'Searching for professionals in your area.' });
        try { 
            // Use backend API for lead submission with proper matching
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            const response = await fetch('/api/lead/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: user?.email || formData.email,  // Use logged-in user's email
                    phone: formData.phone,
                    customerType: formData.customerType,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    materialCategories: formData.materialCategories,
                    materialCategory: formData.materialCategories[0] || '',
                    projectType: formData.projectType,
                    budget: formData.budget,
                    timeline: formData.timeline,
                    projectDetails: formData.projectDetails,
                    description: formData.projectDetails,
                    professionalType: formData.professionalType,
                    isLookingForPro: formData.professionalType === 'trade' || formData.professionalType === 'both',
                    source: 'professional-network',
                    // Force the customer email to be the logged-in user's email
                    customerEmail: user?.email || formData.email,
                    customerName: formData.name
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                toast.toast({ title: 'Success!', description: 'Lead submitted! We will connect you with a pro shortly.' }); 
                setFormData(initialFormState);
                setSubmitted(true);
            } else {
                throw new Error(result.message || 'Failed to submit lead');
            }
        } 
        catch(err) { toast.toast({ title: 'Error', description: err.message || 'Failed to submit lead.', variant: 'destructive' }); } 
        finally { setLoading(false); }
    };

    // Show thank you message after successful submission
    if (submitted) {
        return (
            <div className="w-full animate-fade-in text-center">
                <div className="mb-6">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
                        <p className="text-green-700 mb-4">Your project request has been submitted successfully.</p>
                        <div className="text-left bg-white rounded-lg p-4 border border-green-200">
                            <h3 className="font-semibold text-slate-800 mb-2">What happens next:</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">1.</span>
                                    <span>We're matching you with qualified professionals in your area</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">2.</span>
                                    <span>You'll receive contact information for matched professionals within 24 hours</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">3.</span>
                                    <span>Each professional will reach out to discuss your project details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">4.</span>
                                    <span>Compare quotes and choose the best fit for your project</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center">
                        <Button onClick={() => { setSubmitted(false); onBack(); }} className="mr-4">
                            Submit Another Request
                        </Button>
                        <Button onClick={() => window.location.href = '/'} variant="outline">
                            Return to Homepage
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in">
             <div className="mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                    <ArrowLeft size={16} />
                    Back
                </button>
            </div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900">🛡️ Trusted by Customers. Built for Peace of Mind.</h2>
                <p className="mt-3 text-slate-600 max-w-2xl mx-auto">From materials to installation, we match you with the best local pros and suppliers, making your project easier, faster, and stress-free.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-3">
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h2 className="text-2xl font-bold text-center text-slate-900">Tell Us About Your Project</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input id="name" value={formData.name} onChange={handleChange} placeholder="Full Name *" />
                                <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email *" />
                                <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Phone Number *" />
                                <Select id="customerType" name="customerType" value={formData.customerType} onChange={handleChange} label="Customer Type *">
                                    <option value="">Select customer type</option>
                                    <option value="homeowner">Homeowner</option>
                                    <option value="designer">Designer</option>
                                    <option value="architect">Architect</option>
                                    <option value="contractor">Contractor</option>
                                    <option value="other">Other</option>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input id="address" value={formData.address} onChange={handleChange} placeholder="Address *" />
                                <Input id="city" value={formData.city} onChange={handleChange} placeholder="City *" />
                                <Select id="state" name="state" value={formData.state} onChange={handleChange} label="State *">
                                    <option value="AL">Alabama</option>
                                    <option value="AK">Alaska</option>
                                    <option value="AZ">Arizona</option>
                                    <option value="AR">Arkansas</option>
                                    <option value="CA">California</option>
                                    <option value="CO">Colorado</option>
                                    <option value="CT">Connecticut</option>
                                    <option value="DE">Delaware</option>
                                    <option value="FL">Florida</option>
                                    <option value="GA">Georgia</option>
                                    <option value="HI">Hawaii</option>
                                    <option value="ID">Idaho</option>
                                    <option value="IL">Illinois</option>
                                    <option value="IN">Indiana</option>
                                    <option value="IA">Iowa</option>
                                    <option value="KS">Kansas</option>
                                    <option value="KY">Kentucky</option>
                                    <option value="LA">Louisiana</option>
                                    <option value="ME">Maine</option>
                                    <option value="MD">Maryland</option>
                                    <option value="MA">Massachusetts</option>
                                    <option value="MI">Michigan</option>
                                    <option value="MN">Minnesota</option>
                                    <option value="MS">Mississippi</option>
                                    <option value="MO">Missouri</option>
                                    <option value="MT">Montana</option>
                                    <option value="NE">Nebraska</option>
                                    <option value="NV">Nevada</option>
                                    <option value="NH">New Hampshire</option>
                                    <option value="NJ">New Jersey</option>
                                    <option value="NM">New Mexico</option>
                                    <option value="NY">New York</option>
                                    <option value="NC">North Carolina</option>
                                    <option value="ND">North Dakota</option>
                                    <option value="OH">Ohio</option>
                                    <option value="OK">Oklahoma</option>
                                    <option value="OR">Oregon</option>
                                    <option value="PA">Pennsylvania</option>
                                    <option value="RI">Rhode Island</option>
                                    <option value="SC">South Carolina</option>
                                    <option value="SD">South Dakota</option>
                                    <option value="TN">Tennessee</option>
                                    <option value="TX">Texas</option>
                                    <option value="UT">Utah</option>
                                    <option value="VT">Vermont</option>
                                    <option value="VA">Virginia</option>
                                    <option value="WA">Washington</option>
                                    <option value="WV">West Virginia</option>
                                    <option value="WI">Wisconsin</option>
                                    <option value="WY">Wyoming</option>
                                </Select>
                            </div>
                            <Input id="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="ZIP Code *" />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                                <div className="space-y-2">
                                    {['tiles', 'stone-slabs', 'vinyl-lvt', 'hardwood', 'carpet', 'heating', 'thermostats'].map((category) => (
                                        <div key={category} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={category}
                                                checked={formData.materialCategories.includes(category)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const newCategories = checked
                                                        ? [...formData.materialCategories, category]
                                                        : formData.materialCategories.filter(c => c !== category);
                                                    setFormData(prev => ({ ...prev, materialCategories: newCategories }));
                                                }}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                            />
                                            <label htmlFor={category} className="text-sm font-normal text-slate-700">
                                                {category === 'stone-slabs' ? 'Stone & Slabs' : 
                                                 category === 'vinyl-lvt' ? 'Vinyl & LVT' : 
                                                 category === 'heating' ? 'Heating Systems' :
                                                 category.charAt(0).toUpperCase() + category.slice(1)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Select id="projectType" name="projectType" value={formData.projectType} onChange={handleChange} label="Project Type *">
                                <option value="">Select project type</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="remodel">Remodel</option>
                                <option value="new-build">New Build</option>
                                <option value="repair">Repair</option>
                                <option value="upgrade">Upgrade</option>
                            </Select>
                            <Select id="budget" name="budget" value={formData.budget} onChange={handleChange} label="Budget (optional)" required={false}>
                                <option value="">Enter your budget</option>
                                <option value="under-1000">Under $1,000</option>
                                <option value="1000-5000">$1,000 - $5,000</option>
                                <option value="5000-10000">$5,000 - $10,000</option>
                                <option value="10000-25000">$10,000 - $25,000</option>
                                <option value="25000-50000">$25,000 - $50,000</option>
                                <option value="over-50000">Over $50,000</option>
                            </Select>
                            <Select id="timeline" name="timeline" value={formData.timeline} onChange={handleChange} label="Timeline *">
                                <option value="">Select timeline</option>
                                <option value="immediately">Immediately</option>
                                <option value="within-1-month">Within 1 Month</option>
                                <option value="within-3-months">Within 3 Months</option>
                                <option value="within-6-months">Within 6 Months</option>
                                <option value="planning-stage">Still Planning</option>
                            </Select>
                            <Textarea id="projectDetails" name="projectDetails" value={formData.projectDetails} onChange={handleChange} label="Project Details"
                                placeholder="Describe your project, specific requirements, and any other details..."/>
                            <Select id="professionalType" name="professionalType" value={formData.professionalType} onChange={handleChange} label="I'm looking for a: *">
                                <option value="vendor">Vendor (Material Supplier)</option>
                                <option value="trade">Trade Professional (Contractor/Installer)</option>
                                <option value="both">Both Vendors and Trade Professionals</option>
                            </Select>
                            <Button type="submit" disabled={loading}><FilePlus size={20}/> {loading ? 'Submitting...' : 'Get Matched Now'}</Button>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2 text-left space-y-6 pt-4">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800">Why You Can Feel Confident</h3>
                        <ul className="mt-4 space-y-4 text-slate-600">
                            <li className="flex items-start gap-4"><ShieldCheck className="text-green-500 mt-1 h-6 w-6 flex-shrink-0" /><div><span className="font-semibold text-slate-700">Completely Free:</span><br/> No fees or subscriptions required to request help or get matched.</div></li>
                            <li className="flex items-start gap-4"><Lock className="text-green-500 mt-1 h-6 w-6 flex-shrink-0" /><div><span className="font-semibold text-slate-700">Private & Secure:</span><br/> Your details are only shared with the most relevant professionals for your project.</div></li>
                            <li className="flex items-start gap-4"><Award className="text-green-500 mt-1 h-6 w-6 flex-shrink-0" /><div><span className="font-semibold text-slate-700">Verified Professionals:</span><br/> Every member of our network is reviewed for quality and reliability.</div></li>
                            <li className="flex items-start gap-4"><UserCheck className="text-green-500 mt-1 h-6 w-6 flex-shrink-0" /><div><span className="font-semibold text-slate-700">No Commitment:</span><br/> Get connected and review your options. Move forward only when you're ready.</div></li>
                        </ul>
                    </div>
                     <div className="text-xs text-slate-500 space-y-4 pt-4 border-t border-slate-200">
                        <div><h4 className="font-bold">🔐 Your Privacy Matters</h4><p>Your privacy is a priority. We only share your contact information with a small number of relevant professionals or local material suppliers based on your specific project request. We will never sell your data or send spam.</p></div>
                        <div><h4 className="font-bold">⚠️ Important Disclaimer</h4><p>Comperra Connect is a matching platform that connects users with independent professionals and vendors. While we vet all listed providers, we are not responsible for the quality, pricing, or results of any work or materials provided. You are encouraged to verify licenses, insurance, and terms before hiring or purchasing.</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfessionalAuthPage({ onBack, defaultView = 'login' }) {
    const [view, setView] = useState(defaultView);
    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
             <div className="mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                    <ArrowLeft size={16} />
                    Back
                </button>
            </div>
             {view === 'login' ? <Login setView={setView} /> : <Register setView={setView} />}
        </div>
    );
}

function LandingPage({ skipToCustomer = false, skipToProfessional = false }) {
    console.log('🔍 LandingPage skipToCustomer:', skipToCustomer);
    console.log('🔍 LandingPage skipToProfessional:', skipToProfessional);
    const [view, setView] = useState(skipToCustomer ? 'customer' : (skipToProfessional ? 'pro' : 'landing')); 
    console.log('🔍 LandingPage initial view:', view);

    if (view === 'customer') {
        return <SubmitLeadForm onBack={() => setView('landing')} />;
    }
    if (view === 'pro') {
        return <ProfessionalAuthPage onBack={() => setView('landing')} defaultView="register" />;
    }

    return (
        <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Your Project, Perfected.</h2>
            <p className="mt-4 text-lg text-slate-600">Start your project today or join our network of trusted professionals.</p>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div onClick={() => setView('customer')} className="p-8 border border-slate-200 rounded-xl hover:shadow-2xl hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <UserCheck className="h-12 w-12 mx-auto text-blue-600" />
                    <h3 className="mt-4 text-xl font-bold text-slate-900">Find a Pro or Supplier</h3>
                    <p className="mt-2 text-slate-600">Get quotes from verified installers and vendors for your project.</p>
                </div>
                 <div onClick={() => setView('pro')} className="p-8 border border-slate-200 rounded-xl hover:shadow-2xl hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <Briefcase className="h-12 w-12 mx-auto text-blue-600" />
                    <h3 className="mt-4 text-xl font-bold text-slate-900">Join as a Pro or Supplier</h3>
                    <p className="mt-2 text-slate-600">Access qualified local leads and grow your business.</p>
                </div>
            </div>
        </div>
    );
}

function AdminPanel() {
    const { signOut } = useContext(AuthContext);
    return (
        <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
                <Button onClick={signOut} variant="secondary" className="!w-auto"><LogOut size={16}/> Logout</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card><h3 className="text-lg font-bold flex items-center gap-2"><BarChart/> Site Analytics</h3>
                    <div className="mt-4 space-y-2">
                        <p className="text-2xl font-semibold">0 <span className="text-base font-normal text-slate-500">Total Members</span></p>
                        <p className="text-2xl font-semibold">0 <span className="text-base font-normal text-slate-500">Total Leads</span></p>
                    </div>
                </Card>
                 <Card><h3 className="font-bold">Recent Members</h3>
                    <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-slate-600">
                        <li>No members yet - first registrations will appear here</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}

function AppContent({ skipToCustomer = false, skipToProfessional = false }) {
    const { user, loading } = useContext(AuthContext);
    if (loading) { return <div className="text-center mt-10"><SkeletonLoader className="h-48 w-full max-w-2xl mx-auto" /></div>; }
    if (user?.isAdmin) return <AdminPanel />;
    // Always show LandingPage for professionals route regardless of login status
    return <LandingPage skipToCustomer={skipToCustomer} skipToProfessional={skipToProfessional} />;
}

// Main App Component
export const ProfessionalNetwork = ({ skipToCustomer = false, skipToProfessional = false }) => {
    console.log('🔍 ProfessionalNetwork skipToCustomer:', skipToCustomer);
    console.log('🔍 ProfessionalNetwork skipToProfessional:', skipToProfessional);
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="bg-gray-50 text-slate-800 font-sans min-h-screen flex flex-col items-center p-4">
                <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                <header className="mb-8 text-center pt-8 w-full">
                    <div className="flex items-center justify-center gap-3"><ShieldCheck className="h-10 w-10 text-blue-600" /><h1 className="text-5xl font-bold text-slate-900">Comperra Connect</h1></div>
                </header>
                <main className="w-full max-w-6xl mx-auto flex-grow flex items-center justify-center">
                    <AppContent skipToCustomer={skipToCustomer} skipToProfessional={skipToProfessional} />
                </main>
                 <footer className="text-center mt-12 text-sm text-slate-500 pb-8">
                    <p>&copy; {new Date().getFullYear()} Comperra Connect. All rights reserved.</p>
                </footer>
            </div>
            <Footer />
        </div>
    );
};