import React from 'react';

export function NewsletterSection() {
  return (
    <div className="bg-gray-800 w-full py-16 px-4 sm:px-6 lg:px-8 text-center rounded-xl shadow-lg mx-auto max-w-7xl my-16">
      <h2 className="text-4xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
      <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
        Join our community of travelers and never miss out on exclusive deals, travel tips,
        and insider insights. Subscribe to our newsletter today!
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 relative"> {/* Added 'relative' to the container */}
        <input
          type="email"
          placeholder="Enter your e-mail address ..."
          // Ensure only left side is rounded for input
          className="w-full sm:w-[28rem] p-3 rounded-l-md rounded-r-none border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400 z-10" // Added z-10 to input
        />
        <button
          type="submit"
          // Increased negative margin significantly and added z-20
          // Ensure only right side is rounded for button
          className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition duration-300 ease-in-out -ml-6 z-20" // Increased -ml- to -ml-6 and added z-20
        >
          Subscribe Now!
        </button>
      </div>
    </div>
  );
}