// AddContent.tsx
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import { FaUpload } from 'react-icons/fa';

interface AddContentProps {
  onNext: () => void;
  onBack: () => void;
}

const AddContent: React.FC<AddContentProps> = ({ onNext, onBack }) => {
  const [content, setContent] = useState(''); // State to hold the editor's content

  // Define the toolbar options
  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  // Define the formats for the editor
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <div className="flex flex-col w-full items-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Content</h2>
        
        {/* Rich Text Editor */}
        <div className="mb-6">
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            modules={modules}
            formats={formats}
            className="h-72 mb-10" // Adjust height and add bottom margin
          />
        </div>

        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center bg-gray-50">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FaUpload className="text-blue-500 text-3xl" />
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Recommended size: <span className="font-semibold">1200 x 800 pixels</span> <span className="text-xs">(3:2 aspect ratio)</span> to fit perfectly in the display area
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full shadow-lg transition-colors duration-200">
            Upload Image
          </button>
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
          Go to Preview →
        </button>
      </div>
    </div>
  );
};

export default AddContent;