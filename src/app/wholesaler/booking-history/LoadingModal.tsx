import React from 'react';

// --- Percentage Loader Modal Component ---
interface PercentageLoaderModalProps {
  isOpen: boolean;
  progress: number;
  message: string;
}

const PercentageLoaderModal: React.FC<PercentageLoaderModalProps> = ({ isOpen, progress, message }) => {
  if (!isOpen) return null;

  // SVG circle properties
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center flex flex-col items-center gap-4 transform transition-all duration-300 scale-95 animate-scale-in">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
            {/* Progress circle */}
            <circle
              className="text-blue-500 transform -rotate-90 origin-center"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-gray-100">
            {`${Math.round(progress)}%`}
          </span>
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-2">{message}</p>
      </div>
      {/* Simple animation style */}
      <style jsx global>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PercentageLoaderModal;