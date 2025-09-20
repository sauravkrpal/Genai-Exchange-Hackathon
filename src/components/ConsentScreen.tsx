import React, { useState } from 'react';

interface ConsentScreenProps {
  onConsent: () => void;
}

const ConsentScreen: React.FC<ConsentScreenProps> = ({ onConsent }) => {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">Data Privacy Consent</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          We value your privacy and are committed to protecting your personal information. By agreeing, you consent to our data usage practices as outlined in our privacy policy. Your data will be used solely to improve your experience and will never be shared with third parties without your explicit consent.
        </p>
        <div className="flex items-start mb-6">
          <input
            type="checkbox"
            id="consent-checkbox"
            checked={isAgreed}
            onChange={() => setIsAgreed(!isAgreed)}
            className="mt-1 mr-2"
          />
          <label htmlFor="consent-checkbox" className="text-gray-600 leading-tight">
            I agree to the privacy policy and understand how my data will be collected, used, and protected in accordance with applicable privacy laws.
          </label>
        </div>
        <button
          onClick={onConsent}
          disabled={!isAgreed}
          className={`w-full py-2 px-4 rounded-lg font-bold transition-colors ${
            isAgreed ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ConsentScreen;