import React from 'react';
import Image from 'next/image';

export function TravelGrowthSection() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">
        <span className="text-blue-600">Simplifying Travel.</span> <span className="text-gray-800">Enabling Growth</span>
      </h1>
      <p className="text-gray-700 text-lg mb-8 max-w-3xl">
        We are always looking at adding Travel Agents and Hotel partners on our platform. Register with us and grow your
        business on the largest travel distribution platform in the world!
      </p>
      {/* Placeholder for the large grey box as per the image */}
      <div className="w-full max-w-5xl h-96 bg-gray-700 rounded-lg shadow-lg">
        {/* This could eventually hold an image, video, or other content */}
      </div>
    </div>
  );
}