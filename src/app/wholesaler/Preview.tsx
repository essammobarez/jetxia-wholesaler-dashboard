import React, { useState } from 'react';
import { FaRegUser, FaRegFileAlt, FaPaperPlane, FaTimes } from 'react-icons/fa';

interface PreviewProps {
  onNext: () => void;
  onBack: () => void;
  campaignName?: string;
  subject?: string;
  previewText?: string;
  emailBody?: string;
  recipientData?: any[][];
}

const Preview: React.FC<PreviewProps> = ({
  onNext,
  onBack,
  campaignName = "Summer Sale Announcement",
  subject = "☀️ Big Savings Are Here! Up to 50% Off",
  previewText = "Don't miss out on our biggest summer sale ever.",
  emailBody = `
    <h1>Hello Valued Customer,</h1>
    <p>Get ready for amazing deals! Our summer collection is now available with discounts up to <strong>50% off</strong>. Whether you're looking for beachwear, outdoor gear, or stylish accessories, we have something for everyone.</p>
    <p>Here's a sneak peek:</p>
    <ul><li>Beach Towels - 20% Off</li><li>Sunglasses - 30% Off</li><li>Outdoor Grills - 15% Off</li></ul>
    <p>Don't wait! These deals won't last forever. Click the link below to start shopping.</p>
    <p><em>Happy Shopping!</em><br/><strong>The Awesome Deals Team</strong></p>
  `,
  recipientData = []
}) => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const headers = recipientData?.[0] || [];
  const rows = recipientData?.slice(1) || [];
  const recipientCount = rows.length;

  return (
    <>
      <div className="flex flex-col w-full items-center">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Campaign Preview</h2>
          <p className="text-gray-500 mt-2">This is the final preview. Review recipients one last time before scheduling.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-fit">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Campaign Details</h3>
            <div className="space-y-5">
              <div className="flex items-start"><FaRegFileAlt className="text-gray-400 mt-1 mr-4 flex-shrink-0" /><div><p className="text-xs text-gray-500">Campaign Name</p><p className="font-medium text-gray-700">{campaignName}</p></div></div>
              <div className="flex items-start"><FaPaperPlane className="text-gray-400 mt-1 mr-4 flex-shrink-0" /><div><p className="text-xs text-gray-500">Subject Line</p><p className="font-medium text-gray-700">{subject}</p></div></div>
              <div className="flex items-start"><FaRegUser className="text-gray-400 mt-1 mr-4 flex-shrink-0" /><div><p className="text-xs text-gray-500">Recipients</p><button onClick={() => setIsListModalOpen(true)} className="font-medium text-blue-600 hover:underline focus:outline-none" disabled={recipientCount === 0}>{recipientCount} Selected Recipients</button></div></div>
            </div>
            <div className="mt-8"><button className="w-full bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors">Send Test Email</button></div>
          </div>

          <div className="lg:col-span-2 bg-gray-200 p-4 sm:p-6 rounded-xl">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mx-auto max-w-2xl">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600"><span className="font-semibold">From:</span> Your Company &lt;newsletter@example.com&gt;</p>
                <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">To:</span> Recipient Name &lt;recipient@example.com&gt;</p>
                <h3 className="text-lg font-bold text-gray-800 mt-3">{subject}</h3>
                <p className="text-xs text-gray-500">{previewText}</p>
              </div>
              <div className="p-2 sm:p-6 bg-white">
                {/* --- ADDED IMAGE FOR REALISTIC PREVIEW --- */}
                
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
                  alt="Summer Sale Banner"
                  className="w-full h-auto object-cover mb-6"
                />
                <div className="prose prose-sm sm:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: emailBody }} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mt-10 flex justify-between items-center">
          <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full transition-colors duration-200">Go Back</button>
          <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200">Go to Schedule →</button>
        </div>
      </div>

      {/* Recipient List Modal (View-Only) */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-5xl m-4 flex flex-col h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">Recipient List ({recipientCount})</h3>
              <button onClick={() => setIsListModalOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"><FaTimes /></button>
            </div>

            <div className="mt-4 overflow-auto flex-grow">
              <table className="min-w-full divide-y divide-gray-200/80">
                <thead className="bg-slate-100 sticky top-0 z-10">
                  <tr>
                    {headers.map((header, index) => (<th key={index} scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{header}</th>))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/80">
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="odd:bg-white even:bg-slate-50">
                      {row.map((cell, cellIndex) => (<td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{cell}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Preview;