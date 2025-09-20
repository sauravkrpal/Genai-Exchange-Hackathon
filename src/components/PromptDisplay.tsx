import React from 'react';

const PromptDisplay: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Creative Prompt</h3>
      <p className="text-gray-600 italic">
        "Your creative writing prompt will appear here..."
      </p>
    </div>
  );
};

export default PromptDisplay;