'use client';

import type { NextPage } from 'next';
import { useState } from 'react';
import MappedHotelsV1 from './MappedHotelsV1';
import MappedHotelsV2 from './MappedHotelsV2';

const MappedHotelsWrapper: NextPage = () => {
  const [activeVersion, setActiveVersion] = useState<'v1' | 'v2'>('v2');

  return (
    <div className="min-h-screen">
      {/* Switch Tabs */}
      <div className="static bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center pb-3">
            <div className="inline-flex bg-white rounded-xl p-1.5 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveVersion('v1')}
                className={`relative px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeVersion === 'v1'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {activeVersion === 'v1' && (
                  <div className="absolute inset-0 bg-blue-600 rounded-lg blur opacity-20"></div>
                )}
                <span className="relative">Classic V1</span>
              </button>
              <button
                onClick={() => setActiveVersion('v2')}
                className={`relative px-8 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeVersion === 'v2'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {activeVersion === 'v2' && (
                  <div className="absolute inset-0 bg-purple-600 rounded-lg blur opacity-20"></div>
                )}
                <span className="relative flex items-center gap-2">
                  Advanced Mapping
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Version Content */}
      <div className="transition-all duration-300">
        {activeVersion === 'v1' ? <MappedHotelsV1 /> : <MappedHotelsV2 />}
      </div>
    </div>
  );
};

export default MappedHotelsWrapper;