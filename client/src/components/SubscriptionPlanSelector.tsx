import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  priceId: string;
  mode: 'payment' | 'subscription';
  description: string;
  features: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

interface SubscriptionPlanSelectorProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onClose: () => void;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'pay-as-you-go',
    name: 'Pay-as-you-go',
    price: '$15/lead',
    priceId: 'price_1Rh0QqHcy0QBYylZ3jBWO7Hb',
    mode: 'payment',
    description: 'For single projects or leads.',
    features: [
      'One-time payment',
      'Standard feature access',
      '50 mile matching radius',
      'Limited support or visibility'
    ]
  },
  {
    id: 'pro-monthly',
    name: 'Pro Plan',
    price: '$49/mo',
    priceId: 'price_1Rh0RZHcy0QBYylZDtfERLX7',
    mode: 'subscription',
    description: 'For professionals and small teams.',
    features: [
      'All Pro features',
      'Priority Support',
      '50 mile matching radius',
      'Unlimited lead claims'
    ],
    isPopular: true
  },
  {
    id: 'pro-yearly',
    name: 'Pro Plan',
    price: '$490/yr',
    priceId: 'price_PRO_YEARLY_PLACEHOLDER',
    mode: 'subscription',
    description: 'Best value for long-term projects.',
    features: [
      'All Pro features',
      'Priority Support',
      '50 mile matching radius',
      'Unlimited lead claims'
    ],
    isBestValue: true
  }
];

export default function SubscriptionPlanSelector({ onSelectPlan, onClose }: SubscriptionPlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile } = useAuth();

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan || !userProfile) return;

    setIsSubmitting(true);
    try {
      // Save subscription selection to Firebase
      const response = await fetch('/api/subscription/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.uid,
          email: userProfile.email,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          price: selectedPlan.price,
          billingCycle: selectedPlan.mode === 'subscription' ? 
            (selectedPlan.id === 'pro-yearly' ? 'yearly' : 'monthly') : 'one-time'
        }),
      });

      if (response.ok) {
        onSelectPlan(selectedPlan);
        setShowModal(false);
      } else {
        console.error('Failed to save subscription selection');
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-lg text-gray-600 text-center mb-8">
            Join now and get access to our premium features.
          </p>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg p-6 flex flex-col relative hover:shadow-xl transition-shadow duration-300 ${
                  plan.isPopular
                    ? 'border-4 border-indigo-500 animate-pulse'
                    : plan.isBestValue
                    ? 'border-2 border-emerald-500'
                    : 'border border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {plan.isBestValue && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                      Save 15%
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                </div>
                
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-300 ${
                    plan.isPopular
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                      : plan.isBestValue
                      ? 'bg-gray-800 text-white hover:bg-gray-900'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Confirm Your Plan
            </h3>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">What is a lead?</h4>
                <p className="text-sm text-gray-600">
                  A lead is a direct connection to a potential customer in your area who has 
                  submitted a project request. Claiming a lead allows you to view project 
                  details and contact the customer.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-bold text-lg text-indigo-600 mb-2">
                  {selectedPlan.name} - {selectedPlan.price}
                </h4>
                <p className="text-sm text-gray-600 mb-4">{selectedPlan.description}</p>
                
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              <button
                onClick={handleConfirmPlan}
                disabled={isSubmitting}
                className={`w-full font-semibold py-3 rounded-lg transition-colors duration-300 ${
                  isSubmitting 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Confirm and Continue'}
              </button>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}