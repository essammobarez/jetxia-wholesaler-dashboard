// Preview.tsx
import React from 'react';
import { FaRegUser, FaBullseye, FaRegFileAlt, FaPaperPlane } from 'react-icons/fa';

// Assume these props are passed down from the parent component (App.tsx)
// They would hold the state from the previous steps.
interface PreviewProps {
  onNext: () => void;
  onBack: () => void;
  // --- Example data from previous steps ---
  campaignName?: string;
  subject?: string;
  previewText?: string;
  emailBody?: string; // This will be an HTML string from the ReactQuill editor
  selectedLists?: string[];
  headerImage?: string;
}

const Preview: React.FC<PreviewProps> = ({ 
  onNext, 
  onBack,
  // Using default values for demonstration purposes
  campaignName = "Summer Sale Announcement",
  subject = "☀️ Big Savings Are Here! Up to 50% Off",
  previewText = "Don't miss out on our biggest summer sale ever.",
  emailBody = `
    <h1>Hello Valued Customer,</h1>
    <p>
      Get ready for amazing deals! Our summer collection is now available with discounts up to <strong>50% off</strong>. 
      Whether you're looking for beachwear, outdoor gear, or stylish accessories, we have something for everyone.
    </p>
    <p>Here's a sneak peek:</p>
    <ul>
      <li>Beach Towels - 20% Off</li>
      <li>Sunglasses - 30% Off</li>
      <li>Outdoor Grills - 15% Off</li>
    </ul>
    <p>
      Don't wait! These deals won't last forever. Click the link below to start shopping.
    </p>
    <p><em>Happy Shopping!</em><br/><strong>The Awesome Deals Team</strong></p>
  `,
  selectedLists = ['Booking Desk Turizm', 'Travel List'],
  headerImage = "https://via.placeholder.com/1200x400.png?text=Campaign+Header+Image"
}) => {
  return (
    <div className="flex flex-col w-full items-center">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Campaign Preview</h2>
        <p className="text-gray-500 mt-2">
          This is how your campaign will look. Review everything before scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        
        {/* Left Column: Campaign Summary */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-fit">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">
            Campaign Details
          </h3>
          <div className="space-y-5">
            <div className="flex items-start">
              <FaRegFileAlt className="text-gray-400 mt-1 mr-4 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Campaign Name</p>
                <p className="font-medium text-gray-700">{campaignName}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaPaperPlane className="text-gray-400 mt-1 mr-4 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Subject Line</p>
                <p className="font-medium text-gray-700">{subject}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaBullseye className="text-gray-400 mt-1 mr-4 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Recipients</p>
                <p className="font-medium text-gray-700">
                  {selectedLists.join(', ')} ({selectedLists.length} lists)
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <button className="w-full bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors">
              Send Test Email
            </button>
          </div>
        </div>

        {/* Right Column: Email Client Preview */}
        <div className="lg:col-span-2 bg-gray-200 p-4 sm:p-6 rounded-xl">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mx-auto">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">From:</span> Your Company &lt;newsletter@example.com&gt;
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">To:</span> Recipient Name &lt;recipient@example.com&gt;
              </p>
              <h3 className="text-lg font-bold text-gray-800 mt-3">{subject}</h3>
              <p className="text-xs text-gray-500">{previewText}</p>
            </div>
            <div className="p-2 sm:p-6 bg-white">
              {headerImage && (
                <div className="mb-6">
                  <img src={headerImage} alt="Campaign Header" className="w-full h-auto rounded-md" />
                </div>
              )}
              {/* Render the HTML content from the rich text editor */}
              <div
                className="prose prose-sm sm:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: emailBody }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mt-10 flex justify-between items-center">
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