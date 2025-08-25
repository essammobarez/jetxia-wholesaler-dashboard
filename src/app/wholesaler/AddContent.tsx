// AddContent.tsx
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import { FaPaperPlane, FaImage } from 'react-icons/fa';

interface AddContentProps {
  onNext: () => void;
  onBack: () => void;
}

const AddContent: React.FC<AddContentProps> = ({ onNext, onBack }) => {
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [emailBody, setEmailBody] = useState(''); // State for the editor's content

  // Define the toolbar options for the rich text editor
  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      [{ 'color': [] }, { 'background': [] }], // Add color options
      [{ 'align': [] }], // Add text alignment
      ['clean']
    ],
  };

  // Define the formats for the editor
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'color', 'background', 'align'
  ];

  return (
    <div className="flex flex-col w-full items-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl mx-auto border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
            <FaPaperPlane size={24} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Compose Your Email</h2>
        </div>
        
        {/* Subject Line */}
        <div className="mb-6">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's the subject of your email?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>

        {/* Preview Text */}
        <div className="mb-6">
          <label htmlFor="previewText" className="block text-sm font-medium text-gray-700 mb-2">
            Preview Text
          </label>
          <input
            type="text"
            id="previewText"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="A catchy snippet to grab attention"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <p className="text-xs text-gray-500 mt-1">This text appears after the subject line in most email inboxes.</p>
        </div>
        
        {/* Rich Text Editor for Email Body */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body
          </label>
          <ReactQuill 
            theme="snow" 
            value={emailBody} 
            onChange={setEmailBody} 
            modules={modules}
            formats={formats}
            className="h-80 mb-10" // Adjust height and add bottom margin for the toolbar
          />
        </div>

        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex flex-col items-center justify-center bg-gray-50 hover:border-blue-500 transition-colors">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <FaImage className="text-gray-500 text-3xl" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Upload a Header Image (Optional)</p>
          <p className="text-xs text-gray-500 mb-4">
            Recommended size: <span className="font-medium">1200 x 800 pixels</span>
          </p>
          <button className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-5 rounded-full border border-gray-300 shadow-sm transition-all">
            Browse Files
          </button>
        </div>
      </div>
      
      <div className="w-full max-w-4xl mt-8 flex justify-between items-center">
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
          Go to Preview →
        </button>
      </div>
    </div>
  );
};

export default AddContent;