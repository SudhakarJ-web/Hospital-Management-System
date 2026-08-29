import React from 'react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ isOpen, onAccept, onDecline }: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🇮🇳 DPDP Patient Privacy Notice</h2>
        <div className="text-sm text-gray-600 space-y-3 mb-6 max-h-60 overflow-y-auto">
          <p>By ticking the agreement below, you explicitly authorize this medical facility to process your personal data and health records.</p>
          <p><strong>1. Use Layer:</strong> Your profile data will be exclusively processed for clinic booking registers, doctor diagnostic records, and automated invoicing parameters.</p>
          <p><strong>2. Retention Block:</strong> Your clinical parameters are securely encrypted on national cloud infrastructure inside the Mumbai region and cannot be shared with marketing vendors.</p>
          <p><strong>3. Your Rights:</strong> You retain the legal right to request a copy of your profile ledger or withdraw this processing permission at any time.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onDecline} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition">
            Decline
          </button>
          <button onClick={onAccept} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition">
            I Accept & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
