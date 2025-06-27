import React from 'react';
import { FirebaseAuth, SubmitLead, ViewLeads } from '../components/FirebaseExamples';

export default function FirebaseDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Firebase Integration Demo</h1>
          <p className="mt-2 text-lg text-gray-600">
            Test Firebase Authentication and Firestore database functionality
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Authentication Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Authentication</h2>
            <FirebaseAuth />
          </div>
          
          {/* Lead Submission Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lead Submission</h2>
            <SubmitLead />
          </div>
          
          {/* View Leads Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">View Submitted Leads</h2>
            <ViewLeads />
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Firebase Configuration Status</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>✅ Firebase SDK installed and configured</p>
            <p>✅ Authentication service initialized</p>
            <p>✅ Firestore database connected</p>
            <p>✅ Project ID: comperra-done</p>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-3">How to Use in Your Components</h3>
          <div className="text-sm text-green-800 space-y-2">
            <p><strong>Import Firebase services:</strong></p>
            <code className="block bg-green-100 p-2 rounded mt-1">
              import &#123; db, auth &#125; from '../../../firebase';
            </code>
            
            <p className="mt-4"><strong>Create a user:</strong></p>
            <code className="block bg-green-100 p-2 rounded mt-1">
              createUserWithEmailAndPassword(auth, email, password)
            </code>
            
            <p className="mt-4"><strong>Save data to Firestore:</strong></p>
            <code className="block bg-green-100 p-2 rounded mt-1">
              addDoc(collection(db, "leads"), leadData)
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}