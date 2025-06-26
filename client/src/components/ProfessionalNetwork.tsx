import React, { useState } from 'react';
import { ShieldCheck, UserPlus, FilePlus, XCircle, MapPin, Star, Phone, Mail, Users, Briefcase, Search } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { firebaseNetworkService } from '@/services/firebase-network';

// Common UI Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white shadow-lg shadow-slate-200/40 rounded-xl p-6 md:p-8 border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'success';
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-400',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 ${variants[variant]} ${className}`} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  id, 
  name, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required = true 
}: {
  id: string;
  name?: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{placeholder}</label>
    <input 
      id={id} 
      name={name || id} 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      required={required} 
      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm p-3" 
    />
  </div>
);

const Select = ({ 
  id, 
  name, 
  value, 
  onChange, 
  children, 
  required = true, 
  label 
}: {
  id: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  required?: boolean;
  label: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <select 
      id={id} 
      name={name || id} 
      value={value} 
      onChange={onChange} 
      required={required} 
      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm p-3 bg-white"
    >
      {children}
    </select>
  </div>
);

const Textarea = ({ 
  id, 
  name, 
  value, 
  onChange, 
  label, 
  placeholder, 
  required = false, 
  description 
}: {
  id: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  placeholder: string;
  required?: boolean;
  description?: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
    {description && <p className="text-xs text-slate-500 mb-1.5">{description}</p>}
    <textarea 
      id={id} 
      name={name || id} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      required={required} 
      rows={3}
      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm p-3" 
    />
  </div>
);

// Lead Submission Form
const LeadSubmissionForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    zipCode: '',
    serviceType: '',
    leadType: 'pro',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await firebaseNetworkService.submitLead(formData);
      toast.success('Lead submitted successfully! Professionals will be notified.');
      setTimeout(() => onClose(), 500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit lead');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Find Professionals Near You</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <XCircle size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="customerName"
            type="text"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Your Name"
          />
          
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
          />
          
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
          />
          
          <Input
            id="zipCode"
            type="text"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="ZIP Code"
          />
          
          <Select
            id="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            label="Service Needed"
          >
            <option value="">Select a service</option>
            <option value="Tiles">Tile Installation</option>
            <option value="Stone & Slabs">Countertop Installation</option>
            <option value="Vinyl & LVT">Vinyl & LVT Installation</option>
            <option value="Hardwood">Hardwood Installation</option>
            <option value="Carpet">Carpet Installation</option>
            <option value="Heating & Thermostats">Heating & Thermostat Installation</option>
          </Select>
          
          <Select
            id="leadType"
            value={formData.leadType}
            onChange={handleChange}
            label="Looking For"
          >
            <option value="pro">Installation Professional</option>
            <option value="vendor">Product Supplier</option>
          </Select>
          
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            label="Project Description"
            placeholder="Describe your project, timeline, and any specific requirements..."
            description="Help professionals understand your needs better"
          />
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Find Professionals'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Simplified success message component
const SuccessMessage = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <Card className="max-w-md w-full text-center">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
        <p className="text-slate-600">
          We'll connect you with qualified professionals in your area within 24 hours.
        </p>
      </div>
      <Button onClick={onClose}>
        Continue Browsing
      </Button>
    </Card>
  </div>
);

// Main Professional Network Component
export const ProfessionalNetwork = () => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Connect with Building Material Professionals
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Find trusted contractors, installers, and suppliers in your area. Get quotes, compare services, and hire with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <div className="text-center">
              <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">For Customers</h3>
              <p className="text-slate-600 mb-6">
                Submit your project details and get connected with qualified professionals in your area
              </p>
              <Button onClick={() => setShowLeadForm(true)}>
                <FilePlus size={20} />
                Find Professionals
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">For Professionals</h3>
              <p className="text-slate-600 mb-6">
                Join our network to receive qualified leads and grow your business
              </p>
              <Button variant="success">
                <UserCheck size={20} />
                Join Network
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Find Qualified Pros</h3>
            <p className="text-slate-600 text-sm">Connect with vetted professionals in your area</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Compare & Choose</h3>
            <p className="text-slate-600 text-sm">Review profiles and get multiple quotes</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Hire with Confidence</h3>
            <p className="text-slate-600 text-sm">Work with trusted, verified professionals</p>
          </div>
        </div>
      </div>

      {showLeadForm && (
        <LeadSubmissionForm onClose={() => {
          setShowLeadForm(false);
          setShowSuccess(true);
        }} />
      )}
      
      {showSuccess && (
        <SuccessMessage onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
};