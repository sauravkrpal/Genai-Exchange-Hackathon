import React from 'react';

interface CaregiverAlertProps {
  onClose: () => void;
}

const CaregiverAlert: React.FC<CaregiverAlertProps> = ({ onClose }) => {
  const handleCallHelpline = () => {
    window.location.href = "tel:988";
  };

  return (
    <div className="fixed inset-0 bg-red-800 flex items-center justify-center p-4 z-50">
      <div className="text-center text-white max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-3xl font-bold"
        >
          &times;
        </button>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Immediate Help Needed</h1>
        <p className="text-lg md:text-xl mb-6">
          Please reach out to a trusted adult or call a helpline. You are not alone, and help is available.
        </p>
        <button
          onClick={handleCallHelpline}
          className="bg-white text-red-800 text-lg font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
        >
          Call Crisis Lifeline: 988
        </button>
        <p className="mt-2 text-sm text-red-100">Available 24/7 • Free & Confidential</p>
      </div>
    </div>
  );
};

export default CaregiverAlert;