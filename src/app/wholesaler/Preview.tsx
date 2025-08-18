// Preview.tsx
import React from 'react';

interface PreviewProps {
  onNext: () => void;
  onBack: () => void;
}

const Preview: React.FC<PreviewProps> = ({ onNext, onBack }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Preview</h2>
        
        {/* Campaign Content Preview */}
        <div className="prose max-w-none text-gray-800 mb-6">
          <h3 className="text-xl font-semibold">Campaign Name</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis lobortis nisl cursus bibendum sit nulla accumsan sodales ornare. At urna viverra non suspendisse neque, lorem. Pretium condimentum pellentesque gravida id etiam sit sed arcu euismod. Rhoncus proin orci duis scelerisque molestie cursus tincidunt aliquam.
          </p>
          <h4 className="text-lg font-medium mt-4">Heading3</h4>
          <ol className="list-decimal pl-5">
            <li>ordered list item</li>
            <li>ordered list item</li>
            <li>ordered list item</li>
            <li>ordered list item</li>
          </ol>
          <p className="mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis lobortis nisl cursus bibendum sit nulla accumsan sodales ornare. At urna viverra non suspendisse neque, lorem. Pretium condimentum pellentesque gravida id etiam sit sed arcu euismod. Rhoncus proin orci duis scelerisque molestie cursus tincidunt aliquam.
          </p>
        </div>

        {/* Placeholder Image */}
        <div className="mt-8 rounded-lg overflow-hidden">
          <img
            src="https://via.placeholder.com/1200x800.png?text=Campaign+Image"
            alt="Campaign Image Preview"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
      <div className="w-full mt-8 flex justify-end space-x-4">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full transition-colors duration-200"
        >
          Go Back
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200"
        >
          Go to Schedule →
        </button>
      </div>
    </div>
  );
};

export default Preview;