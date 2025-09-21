import React, { useState } from 'react';
import { FaRegUser, FaRegFileAlt, FaPaperPlane, FaTimes } from 'react-icons/fa';

type Subscriber = {
  _id: string;
  email: string;
  name: string;
  phone: string;
  country: string;
  status: string;
};

type CampaignData = {
  title: string;
  description: string;
  listIds: string[];
  fromName: string;
  fromEmail: string;
  subject: string;
  html: string;
  text: string;
  sendNow: boolean;
  scheduledAt?: string;
};

interface PreviewProps {
  onNext: () => void;
  onBack: () => void;
  campaignData: CampaignData;
  recipientData: Subscriber[];
}

const Preview: React.FC<PreviewProps> = ({ onNext, onBack, campaignData, recipientData }) => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const headers = ['Email', 'Name', 'Phone', 'Country', 'Status'];
  const recipientCount = recipientData.length;

  // A default body if none is provided yet
  const defaultHtml = `<p>Your email content has not been set yet. Go back to the 'Add Content' step to compose your message.</p>`;

  return (
    <>
      <div className="flex flex-col w-full items-center">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Campaign Preview</h2>
          <p className="text-gray-500 mt-2">This is the final preview. Review everything before scheduling.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-fit">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Campaign Details</h3>
            <div className="space-y-5">
              <div className="flex items-start"><FaRegFileAlt className="text-gray-400 mt-1 mr-4 flex-shrink-0" /><div><p className="text-xs text-gray-500">Campaign Name</p><p className="font-medium text-gray-700">{campaignData.title || '(Not Set)'}</p></div></div>
              <div className="flex items-start"><FaPaperPlane className="text-gray-400 mt-1 mr-4 flex-shrink-0" /><div><p className="text-xs text-gray-500">Subject Line</p><p className="font-medium text-gray-700">{campaignData.subject || '(Not Set)'}</p></div></div>
              <div className="flex items-start"><FaRegUser className="text-gray-400 mt-1 mr-4 flex-shrink-0" /><div><p className="text-xs text-gray-500">Recipients</p><button onClick={() => setIsListModalOpen(true)} className="font-medium text-blue-600 hover:underline focus:outline-none" disabled={recipientCount === 0}>{recipientCount} Selected Recipients</button></div></div>
            </div>
            <div className="mt-8"><button className="w-full bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg hover:bg-blue-200 transition-colors">Send Test Email</button></div>
          </div>

          <div className="lg:col-span-2 bg-gray-200 p-4 sm:p-6 rounded-xl">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mx-auto max-w-2xl">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600"><span className="font-semibold">From:</span> {campaignData.fromName} &lt;{campaignData.fromEmail}&gt;</p>
                <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">To:</span> Recipient Name &lt;recipient@example.com&gt;</p>
                <h3 className="text-lg font-bold text-gray-800 mt-3">{campaignData.subject || '(No Subject)'}</h3>
              </div>
              <div className="p-2 sm:p-6 bg-white">
                <div className="prose prose-sm sm:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: campaignData.html || defaultHtml }} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mt-10 flex justify-between items-center">
          <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full transition-colors duration-200">Go Back</button>
          <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-colors duration-200">Go to Schedule</button>
        </div>
      </div>

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
                  {recipientData.map((row) => (
                    <tr key={row._id} className="odd:bg-white even:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.country}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.status}</td>
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